#[starknet::component]
pub mod TournamentComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::interface::{IMinigameDispatcher, IMinigameDispatcherTrait};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::token::erc721::interface::{IERC721Dispatcher, IERC721DispatcherTrait};
    use starknet::ContractAddress;
    use crate::models::config::ConfigAssert;
    use crate::models::game::GameAssert;
    use crate::models::leaderboard::{LeaderboardAssert, LeaderboardTrait};
    use crate::models::prize::{PrizeAssert, PrizeTrait};
    use crate::models::reward::{RewardAssert, RewardTrait};
    use crate::models::tournament::{Tournament, TournamentAssert, TournamentTrait};
    use crate::random::RandomImpl;
    use crate::systems::minigame::NAME as GAME_NAME;
    use crate::types::game_config::DefaultGameConfig;
    use crate::{Store, StoreImpl};

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

            // [Check] Tournament does not exist
            let identifier = self.uuid();
            let tournament = store.tournament(identifier);
            tournament.assert_not_exist();

            // [Effect] Create tournament
            let tournament = self.create(world, identifier, ref store);
            store.set_tournament(@tournament);
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
            let identifier = self.uuid() + 1;
            let tournament = store.tournament(identifier);
            if !tournament.exists() {
                self.create(world, identifier, ref store);
            }

            // [Effect] Enter tournament
            let identifier = self.uuid();
            let mut tournament = store.tournament(identifier);
            tournament.enter();
            store.set_tournament(@tournament);

            // [Return] Tournament ID
            tournament.id
        }

        fn sponsor(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            tournament_id: u64,
            leaderboard_index: u32,
            token_address: ContractAddress,
            amount: u128,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Interaction] Pay
            let token = IERC20Dispatcher { contract_address: token_address };
            let sender = starknet::get_caller_address();
            let recipient = starknet::get_contract_address();
            token.transfer_from(sender, recipient, amount.into());

            // [Effect] Update or create the corresponding prize
            let mut prize = store.prize(tournament_id, token_address.into());
            prize.sponsor(amount);
            store.set_prize(@prize);
        }

        fn claim(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            tournament_id: u64,
            token_address: ContractAddress,
            game_id: u64,
            position: u32,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Tournament does exist
            let tournament = store.tournament(tournament_id);
            tournament.assert_does_exist();

            // [Check] Tournament is over
            tournament.assert_is_over();

            // [Check] Prize does exist
            let prize = store.prize(tournament_id, token_address.into());
            prize.assert_does_exist();

            // [Check] Reward not claimed
            let reward = store.reward(tournament_id, token_address.into(), game_id);
            reward.assert_not_claimed();

            // [Check] Game does exist
            let game = store.game(game_id);
            game.assert_does_exist();

            // [Check] Game position in the leaderboard is correct
            let leaderboard = store.leaderboard(tournament_id);
            leaderboard.assert_at_position(game_id, position);

            // [Effect] Claim reward
            let capacity = leaderboard.capacity(tournament.entry_count);
            let reward = RewardTrait::new(tournament_id, token_address.into(), game_id);
            store.set_reward(@reward);

            // [Interaction] Send reward to the game owner
            let token = IERC20Dispatcher { contract_address: token_address };
            let collection_address = self.get_collection_address(world);
            let collection = IERC721Dispatcher { contract_address: collection_address };
            let recipient = collection.owner_of(game_id.into());
            let payout = prize.payout(position, capacity);
            token.transfer(recipient, payout.into());
        }

        fn rescue(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            tournament_id: u64,
            token_address: ContractAddress,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Tournament does exist
            let tournament = store.tournament(tournament_id);
            tournament.assert_does_exist();

            // [Check] Tournament is over
            tournament.assert_is_over();

            // [Check] Prize does exist
            let mut prize = store.prize(tournament_id, token_address.into());
            prize.assert_does_exist();

            // [Check] Leaderboard is empty
            let leaderboard = store.leaderboard(tournament_id);
            leaderboard.assert_is_empty();

            // [Check] Caller is allowed
            let config = store.config();
            config.assert_is_owner(starknet::get_caller_address());

            // [Effect] Clear prize
            let prize_amount = prize.amount;
            prize.clear();
            store.set_prize(@prize);

            // [Interaction] Transfer prize to the owner
            let token = IERC20Dispatcher { contract_address: token_address };
            let owner = store.config().owner;
            token.transfer(owner, prize_amount.into());
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
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            identifier: u64,
            ref store: Store,
        ) -> Tournament {
            // [Return] Tournament
            let start_time = identifier * ONE_WEEK - FOUR_DAYS;
            TournamentTrait::new(identifier, start_time, ONE_WEEK)
        }

        #[inline]
        fn get_collection_address(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ContractAddress {
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            let minigame = IMinigameDispatcher { contract_address: game_address };
            minigame.token_address()
        }
    }
}
