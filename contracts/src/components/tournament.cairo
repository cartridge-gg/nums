#[starknet::component]
pub mod TournamentComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::interface::{IMinigameDispatcher, IMinigameDispatcherTrait};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::token::erc721::interface::{IERC721Dispatcher, IERC721DispatcherTrait};
    use quest::components::questable::QuestableComponent;
    use quest::components::questable::QuestableComponent::InternalImpl as QuestableInternalImpl;
    use starknet::ContractAddress;
    use crate::constants::{DEFAULT_MAX_CAPACITY, TEN_POW_18};
    use crate::elements::quests::leader;
    use crate::interfaces::nums::INumsTokenDispatcherTrait;
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::models::game::GameAssert;
    use crate::models::leaderboard::{LeaderboardAssert, LeaderboardTrait};
    use crate::models::prize::{PrizeAssert, PrizeTrait};
    use crate::models::reward::{RewardAssert, RewardTrait};
    use crate::models::tournament::{Tournament, TournamentAssert, TournamentTrait};
    use crate::random::RandomImpl;
    use crate::systems::minigame::NAME as MINIGAME;
    use crate::{StoreImpl, StoreTrait};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Tournament does not exist
            let identifier = TournamentTrait::uuid();
            let tournament = store.tournament(identifier);
            tournament.assert_not_exist();

            // [Effect] Create tournament
            let tournament = TournamentTrait::new(identifier, 0);
            store.set_tournament(@tournament);
        }

        fn enter(ref self: ComponentState<TContractState>, world: WorldStorage) -> Tournament {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Effect] Create next tournament if it doesn't exist
            let identifier = TournamentTrait::uuid() + 1;
            let tournament = store.tournament(identifier);
            let usage = store.usage();
            if !tournament.exists() {
                let tournament = TournamentTrait::new(identifier, usage.board);
                store.set_tournament(@tournament);
            }

            // [Effect] Enter tournament
            let identifier = TournamentTrait::uuid();
            let mut tournament = store.tournament(identifier);
            if !tournament.exists() {
                tournament = TournamentTrait::new(identifier, usage.board);
            }
            tournament.enter();
            store.set_tournament(@tournament);

            // [Effect] Create leaderboard if it doesn't exist
            let leaderboard = store.leaderboard(tournament.id);
            if !leaderboard.exists() {
                let leaderboard = LeaderboardTrait::new(tournament.id, DEFAULT_MAX_CAPACITY);
                store.set_leaderboard(@leaderboard);
            }

            // [Effect] Update prize
            let config = store.config();
            let entry_price: u256 = config.entry_price.into();
            let (_, to_prize) = config.split(entry_price);
            let nums_disp = store.nums_disp();
            let nums_address = nums_disp.contract_address;
            let mut prize = store.prize(tournament.id, nums_address.into());
            let amount: u128 = to_prize.try_into().unwrap();
            prize.sponsor(amount);
            store.set_prize(@prize);

            // [Interaction] Mint the share to the prize pool
            let recipient = starknet::get_contract_address();
            nums_disp.reward(recipient, (to_prize / TEN_POW_18.into()).try_into().unwrap());

            // [Return] Tournament ID
            tournament
        }

        fn sponsor(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            tournament_id: u16,
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
            tournament_id: u16,
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
            let collection_address = self.get_minigame(world).token_address();
            let collection = IERC721Dispatcher { contract_address: collection_address };
            let recipient = collection.owner_of(game_id.into());
            let payout = prize.payout(position, capacity);
            token.transfer(recipient, payout.into());

            // [Effect] Update quest progression for the player - Leader tasks
            let player: felt252 = recipient.into();
            let questable = get_dep_component!(@self, Quest);
            if position < 5 {
                questable.progress(world, player, leader::LeaderOne::identifier(), 1, true);
            }
            if position < 3 {
                questable.progress(world, player, leader::LeaderTwo::identifier(), 1, true);
            }
            if position == 1 {
                questable.progress(world, player, leader::LeaderThree::identifier(), 1, true);
            }
        }

        fn rescue(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            tournament_id: u16,
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
        fn get_minigame(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> IMinigameDispatcher {
            let (game_address, _) = world.dns(@MINIGAME()).unwrap();
            IMinigameDispatcher { contract_address: game_address }
        }
    }
}
