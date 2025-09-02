use starknet::ContractAddress;
use nums::token::Token;
use nums::constants::ZERO_ADDRESS;



// #[derive(Copy, Drop, Serde, PartialEq)]
// #[dojo::model]
// pub struct PerpNumsJackpot {
//     #[key]
//     pub id: u32,
//     pub nums_balance: u256,
//     pub winner: Option<ContractAddress>,
// }


// #[derive(Copy, Drop, Serde, PartialEq)]
// #[dojo::model]
// pub struct TokenJackpot {
//     #[key]
//     pub id: u32,
//     pub nums_balance: u256,
//     pub token: Option<Token>,
//     pub mode: JackpotMode,

// }


#[derive(Copy, Drop, Serde, PartialEq)]
#[dojo::model]
pub struct Jackpot {
    #[key]
    pub id: u32,
    pub title: felt252,
    pub creator: ContractAddress,
    pub mode: JackpotMode,
    pub expiration: u64,
    pub token: Option<Token>,
    pub winner: Option<ContractAddress>,
    pub claimed: bool,
    pub verified: bool,
}

#[derive(Copy, Drop, Serde, PartialEq, Default, Introspect, DojoStore)]
pub enum JackpotMode {
    #[default]
    KING_OF_THE_HILL: KingOfTheHill,
    CONDITIONAL_VICTORY: ConditionalVictory,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect, DojoStore)]
pub struct KingOfTheHill {
    pub extension_time: u64,
    pub remaining_slots: u8,
    pub king: ContractAddress,
}

#[derive(Copy, Drop, Serde, PartialEq, Default, Introspect, DojoStore)]
pub struct ConditionalVictory {
    pub slots_required: u8,
}

impl DefaultImpl of Default<KingOfTheHill> {
    fn default() -> KingOfTheHill {
        KingOfTheHill { extension_time: 0, remaining_slots: 0, king: ZERO_ADDRESS }
    }
}

#[generate_trait]
pub impl JackpotModeImpl of JackpotModeTrait {
    fn new(mode: JackpotMode, max_slots: u8, expiration: u64) -> JackpotMode {
        match mode {
            JackpotMode::KING_OF_THE_HILL(params) => {
                assert!(expiration != 0, "King of the Hill must have expiration");

                JackpotMode::KING_OF_THE_HILL(
                    KingOfTheHill {
                        extension_time: params.extension_time,
                        king: ZERO_ADDRESS,
                        remaining_slots: max_slots,
                    },
                )
            },
            JackpotMode::CONDITIONAL_VICTORY(params) => {
                assert!(params.slots_required <= max_slots, "slots_required exceeds max_slots");

                mode
            },
        }
    }
}

#[generate_trait]
pub impl JackpotImpl of JackpotTrait {
    /// Determines if the Jackpot can be claimed based on the current game state.
    ///
    /// # Arguments
    /// * `self` - A reference to the Jackpot struct.
    /// * `nums` - An array of numbers representing the current game state.
    ///
    /// # Returns
    /// * `bool` - True if the Jackpot can be claimed, false otherwise.
    fn can_claim(self: @Jackpot, nums: @Array<u16>) -> bool {
        match self.mode {
            JackpotMode::CONDITIONAL_VICTORY(condition) => {
                if nums.len() >= (*condition.slots_required).into() {
                    return true;
                }

                return false;
            },
            JackpotMode::KING_OF_THE_HILL(condition) => {
                if *condition.king == starknet::get_caller_address() {
                    return true;
                }

                return false;
            },
        }
    }
}


