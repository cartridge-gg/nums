use starknet::ContractAddress;
use crate::models::budokan::{
    EntryFee, EntryRequirement, GameConfig, Metadata, Phase, Prize, PrizeType, QualificationProof,
    Schedule, Tournament as BudokanTournament,
};


#[starknet::interface]
pub trait IBudokan<TState> {
    fn tournament(self: @TState, tournament_id: u64) -> BudokanTournament;
    fn get_prize(self: @TState, prize_id: u64) -> Prize;
    fn current_phase(self: @TState, tournament_id: u64) -> Phase;
    fn get_tournament_id_for_token_id(
        self: @TState, game_address: ContractAddress, token_id: u64,
    ) -> u64;
    fn create_tournament(
        ref self: TState,
        creator_rewards_address: ContractAddress,
        metadata: Metadata,
        schedule: Schedule,
        game_config: GameConfig,
        entry_fee: Option<EntryFee>,
        entry_requirement: Option<EntryRequirement>,
    ) -> BudokanTournament;
    fn enter_tournament(
        ref self: TState,
        tournament_id: u64,
        player_name: felt252,
        player_address: ContractAddress,
        qualification: Option<QualificationProof>,
    ) -> (u64, u32);
    fn submit_score(ref self: TState, tournament_id: u64, token_id: u64, position: u8);
    fn claim_prize(ref self: TState, tournament_id: u64, prize_type: PrizeType);
}

#[starknet::component]
pub mod TournamentComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use crate::constants::{BUDOKAN_MAINNET, BUDOKAN_SEPOLIA, TEN_POW_18};
    use crate::models::budokan::{EntryFee, GameConfig, Metadata, Period, Schedule};
    use crate::models::tournament::{TournamentAssert, TournamentTrait};
    use crate::random::RandomImpl;
    use crate::systems::minigame::NAME as GAME_NAME;
    use crate::systems::settings::SETTINGS_ID;
    use crate::types::game_config::DefaultGameConfig;
    use crate::{Store, StoreImpl};
    use super::{BudokanTournament, IBudokanDispatcher, IBudokanDispatcherTrait};

    // Constants

    pub const CREATOR_SHARE: u8 = 50;
    pub const ENTRY_PRICE: u128 = 2000;
    pub const PRIZE_SPOTS: u8 = 5;
    pub const SIX_DAYS: u64 = 6 * 24 * 60 * 60;
    pub const THREE_DAYS: u64 = 3 * 24 * 60 * 60;
    pub const FOUR_DAYS: u64 = 4 * 24 * 60 * 60;
    pub const ONE_DAY: u64 = 24 * 60 * 60;
    pub const ONE_WEEK: u64 = 7 * 24 * 60 * 60;
    pub const DISTRIBUTION: [u8; 5] = [26, 13, 6, 3, 2]; // In complement of the creator share
    pub const SN_SEPOLIA: felt252 = 'SN_SEPOLIA';

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Effect] Create tournament
            self._create(world, self.uuid(), ref store);
        }

        fn create(ref self: ComponentState<TContractState>, world: WorldStorage) -> u64 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Tournament does not exist
            let uuid = self.uuid();
            let tournament = store.tournament(uuid);
            tournament.assert_not_exist();

            // [Interaction] Create tournament
            self._create(world, uuid, ref store);

            // [Return] Tournament ID
            tournament.id
        }

        fn enter(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            tournament_id: u64,
            player_name: felt252,
        ) -> u64 {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Effect] Create next tournament if it doesn't exist
            let uuid = self.uuid() + 1;
            let tournament = store.tournament(uuid);
            if !tournament.exists() {
                self._create(world, uuid, ref store);
            }

            // [Interaction] Enter tournament
            let budokan = self.budokan();
            let (token_id, _entry_id) = budokan
                .enter_tournament(
                    tournament_id: tournament_id,
                    player_name: player_name,
                    player_address: starknet::get_caller_address(),
                    qualification: Option::None,
                );
            token_id
        }

        fn submit(
            ref self: ComponentState<TContractState>, world: WorldStorage, tournament_id: u64,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Tournament exists
            let tournament = store.tournament(tournament_id);
            tournament.assert_does_exist();

            // [Interaction] Submit score
            let mut leaderboard = store.leaderboard(tournament_id);
            let budokan = self.budokan();
            let mut position = 1;
            while let Option::Some(game) = leaderboard.games.pop_front() {
                budokan.submit_score(tournament_id, game, position);
                position += 1;
            }
        }

        fn get_tournament_id(
            self: @ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) -> u64 {
            let budokan = self.budokan();
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            budokan.get_tournament_id_for_token_id(game_address, game_id)
        }

        #[inline]
        fn get_game_config(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> GameConfig {
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            GameConfig { address: game_address, settings_id: SETTINGS_ID, prize_spots: PRIZE_SPOTS }
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        #[inline]
        fn uuid(self: @ComponentState<TContractState>) -> u64 {
            let now = starknet::get_block_timestamp();
            (now + FOUR_DAYS) / ONE_WEEK
        }

        #[inline]
        fn get_metadata(self: @ComponentState<TContractState>) -> Metadata {
            Metadata { name: 'Nums Tournament', description: "Nums autonomous weekly tournament" }
        }

        #[inline]
        fn get_schedule(self: @ComponentState<TContractState>) -> Schedule {
            let identifier = self.uuid();
            let start_time = identifier * ONE_WEEK - FOUR_DAYS;
            let end_time = start_time + ONE_WEEK;
            Schedule {
                registration: Option::None,
                game: Period { start: start_time, end: end_time },
                submission_duration: ONE_DAY,
            }
        }

        #[inline]
        fn get_entry_fee(self: @ComponentState<TContractState>, world: WorldStorage) -> EntryFee {
            let mut store = StoreImpl::new(world);
            let config = store.config();
            let token_address = config.nums_address;
            EntryFee {
                token_address: token_address,
                amount: ENTRY_PRICE * TEN_POW_18,
                distribution: DISTRIBUTION.span(),
                tournament_creator_share: Option::None,
                game_creator_share: Option::Some(CREATOR_SHARE),
            }
        }

        #[inline]
        fn _create(
            self: @ComponentState<TContractState>, world: WorldStorage, uuid: u64, ref store: Store,
        ) -> BudokanTournament {
            // [Interaction] Create tournament
            let budokan = self.budokan();
            let tournament = budokan
                .create_tournament(
                    creator_rewards_address: starknet::get_contract_address(),
                    metadata: self.get_metadata(),
                    schedule: self.get_schedule(),
                    game_config: self.get_game_config(world),
                    entry_fee: Option::Some(self.get_entry_fee(world)),
                    entry_requirement: Option::None,
                );

            // [Effect] Create tournament
            store.set_tournament(@TournamentTrait::new(uuid, tournament.id));

            // [Return] Tournament
            tournament
        }

        #[inline]
        fn budokan(self: @ComponentState<TContractState>) -> IBudokanDispatcher {
            let chain_id = starknet::get_tx_info().unbox().chain_id;
            let contract_address = if chain_id == SN_SEPOLIA {
                BUDOKAN_SEPOLIA
            } else {
                BUDOKAN_MAINNET
            };
            IBudokanDispatcher { contract_address: contract_address }
        }
    }
}
