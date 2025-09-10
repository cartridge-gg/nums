use core::num::traits::{Pow, Zero};
use dojo::world::WorldStorage;
use nums::constants::ONE_YEAR;
use nums::interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
use nums::interfaces::nums::INumsTokenDispatcherTrait;
use nums::models::{DefaultGameConfig, DefaultGameRewardImpl, GameConfig};
use nums::store::{Store, StoreImpl, StoreTrait};
// use nums::interfaces::erc721::{IERC721Dispatcher, IERC721DispatcherTrait};
use nums::token::{Token, TokenType};
use starknet::ContractAddress;
use super::jackpot;


impl CloneOptionToken of Clone<Option<Token>> {
    fn clone(self: @Option<Token>) -> Option<Token> {
        match self {
            Option::Some(t) => Option::Some(t.clone()),
            Option::None => Option::None,
        }
    }
}

#[derive(Drop, Serde, PartialEq)]
pub struct CreateJackpotFactoryParams {
    pub name: ByteArray,
    pub game_config: Option<GameConfig>,
    pub rewards: Option<Array<u32>>,
    pub token: Option<Token>,
    pub mode: JackpotMode,
    pub timing_mode: TimingMode,
    pub initial_duration: u64,
    pub extension_duration: u64,
    pub min_slots: u8,
    pub max_winners: u8,
    pub jackpot_count: u8,
}


#[derive(Drop, Serde, PartialEq)]
#[dojo::model]
pub struct JackpotFactory {
    #[key]
    pub id: u32,
    pub name: ByteArray,
    pub creator: ContractAddress,
    pub game_config: GameConfig,
    pub rewards: Array<u32>,
    pub token: Option<Token>,
    pub mode: JackpotMode,
    pub timing_mode: TimingMode,
    pub initial_duration: u64,
    pub extension_duration: u64,
    pub min_slots: u8,
    pub max_winners: u8,
    //
    pub current_jackpot_id: Option<u32>,
    pub remaining_count: Option<u8> // None = infinite
}


#[derive(Drop, Serde, PartialEq)]
#[dojo::model]
pub struct Jackpot {
    #[key]
    pub id: u32,
    pub factory_id: u32,
    pub nums_balance: u256,
    pub token: Option<Token>,
    pub mode: JackpotMode,
    pub created_at: u64,
    pub end_at: u64,
    pub best_score: u8,
    pub total_winners: u8,
    pub last_winner_index: u8,
    pub extension_count: u8,
    pub rescued: bool,
}

#[derive(Drop, Serde, PartialEq)]
#[dojo::model]
pub struct JackpotWinner {
    #[key]
    pub jackpot_id: u32,
    #[key]
    pub index: u8,
    pub player: ContractAddress,
    pub game_id: u32,
    pub claimed: bool,
}

#[derive(Copy, Drop, Serde, PartialEq, Default, Introspect, DojoStore)]
pub enum TimingMode {
    #[default]
    TimeLimited,
    Perpetual,
}


#[derive(Copy, Drop, Serde, PartialEq, Default, Introspect, DojoStore)]
pub enum JackpotMode {
    #[default]
    KingOfTheHill,
    ConditionalVictory,
}


#[generate_trait]
pub impl JackpotFactoryImpl of JackpotFactoryTrait {
    fn new(
        ref world: WorldStorage,
        ref store: Store,
        jackpot_actions_addr: ContractAddress,
        creator: ContractAddress,
        params: CreateJackpotFactoryParams,
    ) -> JackpotFactory {
        let mut params = params;
        let id = store.next_id('JackpotFactory');
        let caller = starknet::get_caller_address();

        // TODO: set right figures here
        // assert!(params.min_slots > 10 && params.min_slots < 21, "invalid min_slot");
        assert!(params.min_slots > 4 && params.min_slots < 21, "invalid min_slot");
        assert!(params.max_winners > 0 && params.max_winners < 100, "invalid max_winners");

        match params.timing_mode {
            TimingMode::TimeLimited => {
                assert!(
                    params.initial_duration > 200 && params.initial_duration < ONE_YEAR,
                    "invalid initial_duration",
                );
                // assert!(
            //     params.extension_duration > 100 && params.extension_duration < ONE_DAY,
            //     "invalid extension_duration",
            // );
            },
            TimingMode::Perpetual => {
                params.initial_duration = 0;
                params.extension_duration = 0;
            },
        }

        if let Option::Some(token) = @params.token {
            match token.ty {
                TokenType::ERC20(config) => {
                    assert!(params.jackpot_count > 0, "invalid jackpot_count");
                    assert!(*config.amount > 0, "invalid amount");
                    // assert!(params.max_winners < 11, "max 10 max_winners");

                    let total_amount = (*config.amount).into() * params.jackpot_count.into();

                    // transfer from caller to jackpot_actions_addr
                    IERC20Dispatcher { contract_address: *token.address }
                        .transfer_from(caller, jackpot_actions_addr, total_amount);
                },
                TokenType::ERC721(_config) => {
                    panic!(
                        "ERC721 not handled yet",
                    ); // assert!(config.ids.len() > 0, "invalid ids");
                    // remaining_count = config.ids.len();
                // assert!(params.max_winners == 1, "max 1 max_winners");
                },
                TokenType::ERC1155(_config) => {
                    panic!("ERC1155 not handled yet"); // assert!(
                    //     config.ids.len() == config.amounts.len(),
                //     "mismatchin array len ids, amounts",
                // );
                // assert!(config.ids.len() > 0, "invalid ids");
                // assert!(params.max_winners == 1, "max 1 max_winners");
                // remaining_count = config.ids.len();
                },
            }
        }

        let remaining_count = if params.token.is_some() {
            Option::Some(params.jackpot_count)
        } else {
            Option::None
        };

        let game_config = params.game_config.unwrap_or_default();
        let rewards = params.rewards.unwrap_or(DefaultGameRewardImpl::default());

        assert!(game_config.max_slots.into() == rewards.len(), "max_slots len != rewards len");

        JackpotFactory {
            id,
            name: params.name,
            creator,
            game_config,
            rewards,
            token: params.token,
            mode: params.mode,
            timing_mode: params.timing_mode,
            initial_duration: params.initial_duration,
            extension_duration: params.extension_duration,
            min_slots: params.min_slots,
            max_winners: params.max_winners,
            //
            current_jackpot_id: Option::None,
            remaining_count: remaining_count.try_into().unwrap(),
        }
    }

    fn create_jackpot(
        ref self: JackpotFactory, ref world: WorldStorage, ref store: Store,
    ) -> Jackpot {
        let now = starknet::get_block_timestamp();

        if let Option::Some(current_jackpot_id) = self.current_jackpot_id {
            let mut jackpot_to_archive = store.jackpot(current_jackpot_id);
            jackpot_to_archive.end_at = now;
            store.set_jackpot(@jackpot_to_archive);
        }

        let id = store.next_id('Jackpot');

        if self.remaining_count.is_some() {
            let value = self.remaining_count.unwrap();
            self.remaining_count = Option::Some(value - 1);
        }
        self.current_jackpot_id = Option::Some(id);

        let created_at = now;
        let end_at = match self.timing_mode {
            TimingMode::TimeLimited => { created_at + self.initial_duration },
            TimingMode::Perpetual => { created_at + ONE_YEAR },
        };

        let jackpot = Jackpot {
            factory_id: self.id,
            id,
            nums_balance: 0,
            token: self.token.clone(),
            mode: self.mode,
            created_at,
            end_at,
            best_score: 0,
            total_winners: 0,
            extension_count: 0,
            last_winner_index: self.max_winners - 1,
            rescued: false,
        };

        store.set_jackpot(@jackpot);
        store.set_jackpot_factory(@self);

        jackpot
    }

    fn can_create_jackpot(self: @JackpotFactory, ref store: Store) -> bool {
        // check current jackpot has ended
        if let Option::Some(current_jackpot_id) = self.current_jackpot_id {
            let jackpot = store.jackpot(*current_jackpot_id);
            if !jackpot.has_ended(ref store) {
                return false;
            }
        }

        match self.timing_mode {
            // check if there is remaing jackpot to be created
            TimingMode::TimeLimited => {
                if self.remaining_count.is_some() {
                    (*self.remaining_count).unwrap() > 0
                } else {
                    true
                }
            },
            TimingMode::Perpetual => { true },
        }
    }

    fn get_reward(self: @JackpotFactory, level: u8) -> u32 {
        *self.rewards.at(level.into())
    }
}

#[generate_trait]
pub impl JackpotImpl of JackpotTrait {
    fn exists(self: @Jackpot) -> bool {
        *self.factory_id > 0
    }


    fn has_ended(self: @Jackpot, ref store: Store) -> bool {
        let mut factory = store.jackpot_factory(*self.factory_id);

        if *self.mode == JackpotMode::ConditionalVictory
            && *self.total_winners == factory.max_winners {
            return true;
        }

        let now = starknet::get_block_timestamp();
        if now >= *self.end_at {
            return true;
        }

        false
    }

    fn add_winner(
        ref self: Jackpot,
        ref store: Store,
        game_id: u32,
        player: ContractAddress,
        is_equal: bool,
        is_better: bool,
    ) -> Option<ContractAddress> {
        let mut factory = store.jackpot_factory(self.factory_id);
        let max_winners = factory.max_winners;

        let winner_idx = if is_equal {
            (self.last_winner_index + 1) % max_winners
        } else {
            0
        };

        if is_equal && self.total_winners < max_winners {
            self.total_winners += 1;
        }
        if is_better {
            self.total_winners = 1;
        }

        let mut jackpot_winner = store.jackpot_winner(self.id, winner_idx);

        let has_replaced = if !jackpot_winner.player.is_zero() && is_equal {
            Option::Some(jackpot_winner.player)
        } else {
            Option::None
        };

        self.last_winner_index = winner_idx;
        jackpot_winner.player = player;
        jackpot_winner.game_id = game_id;
        store.set_jackpot_winner(@jackpot_winner);

        has_replaced
    }

    fn extend_time(ref self: Jackpot, ref store: Store) -> u64 {
        let mut factory = store.jackpot_factory(self.factory_id);

        if factory.extension_duration > 0 {
            self.extension_count += 1;
            let divisor = 2_u64.pow(self.extension_count.into());
            let extension_time = factory.extension_duration / divisor;
            self.end_at += extension_time;
            extension_time
        } else {
            0
        }
    }

    fn claim(
        self: @Jackpot, ref store: Store, indexes: Array<u8>, player: ContractAddress,
    ) -> bool {
        let mut has_claim = false;
        let total_winners = *self.total_winners;
        let nums_share = *self.nums_balance / total_winners.into();

        let mut claimable_nums = 0_u256;
        let mut claimable_token = 0_u256;

        let indexes_len = indexes.len();
        let mut i = 0;
        while i < indexes_len {
            let index = *indexes.at(i);
            assert!(index < total_winners, "invalid index");

            let mut winner = store.jackpot_winner(*self.id, index);
            assert!(!winner.claimed, "already claimed");

            if winner.player == player && !winner.claimed {
                has_claim = true;
                claimable_nums += nums_share;

                if let Option::Some(token) = self.token {
                    match token.ty {
                        TokenType::ERC20(erc_20) => {
                            let token_share = *erc_20.amount / total_winners.into();
                            claimable_token += token_share;
                        },
                        _ => { panic!("not handled") },
                    }
                }
                winner.claimed = true;
                store.set_jackpot_winner(@winner);
            }
            i += 1;
        }

        println!("claimable_nums : {}", claimable_nums);
        println!("claimable_token : {}", claimable_token);

        if claimable_nums > 0 {
            store.nums_disp().transfer(player, claimable_nums);
        }
        if claimable_token > 0 {
            let token = self.token.clone();
            let erc_20_disp = IERC20Dispatcher { contract_address: token.unwrap().address };
            erc_20_disp.transfer(player, claimable_token);
        }

        has_claim
    }
}
// #[derive(Drop, Serde, PartialEq)]
// pub struct Claimable {
//     pub nums_amount: u256,
//     pub token: Option<Token>,
// }

// #[derive(Copy, Drop, Serde, PartialEq)]
// #[dojo::model]
// pub struct Jackpot {
//     #[key]
//     pub factory_id: u32,
//     #[key]
//     pub id: u32,
//     pub title: felt252,
//     pub creator: ContractAddress,
//     pub mode: JackpotMode,
//     pub expiration: u64,
//     pub token: Option<Token>,
//     pub winner: Option<ContractAddress>,
//     pub claimed: bool,
//     pub verified: bool,
// }

// #[generate_trait]
// pub impl JackpotModeImpl of JackpotModeTrait {
//     fn new(mode: JackpotMode, max_slots: u8, expiration: u64) -> JackpotMode {
//         match mode {
//             JackpotMode::KingOfTheHill(params) => {
//                 assert!(expiration != 0, "King of the Hill must have expiration");

//                 JackpotMode::KingOfTheHill(
//                     KingOfTheHillConfig { extension_time: params.extension_time // king:
//                     ZERO_ADDRESS, // remaining_slots: max_slots,
//                     },
//                 )
//             },
//             JackpotMode::ConditionalVictory(params) => {
//                 assert!(params.slots_required <= max_slots, "slots_required exceeds max_slots");

//                 mode
//             },
//         }
//     }
// }

// #[generate_trait]
// pub impl JackpotImpl of JackpotTrait {
//     /// Determines if the Jackpot can be claimed based on the current game state.
//     ///
//     /// # Arguments
//     /// * `self` - A reference to the Jackpot struct.
//     /// * `nums` - An array of numbers representing the current game state.
//     ///
//     /// # Returns
//     /// * `bool` - True if the Jackpot can be claimed, false otherwise.
//     fn can_claim(self: @Jackpot, nums: @Array<u16>) -> bool {
//         match self.mode {
//             JackpotMode::ConditionalVictory(condition) => {
//                 if nums.len() >= (*condition.slots_required).into() {
//                     return true;
//                 }

//                 return false;
//             },
//             JackpotMode::KingOfTheHill(condition) => {
//                 // if *condition.king == starknet::get_caller_address() {
//                 //     return true;
//                 // }

//                 return false;
//             },
//         }
//     }
// }


