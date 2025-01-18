use starknet::ContractAddress;
use nums_common::token::Token;

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
    pub claimed: bool, // gql lacks ability to filter on winner Option, use bool for filtering on active Jackpots
    pub verified: bool,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum JackpotMode {
    KING_OF_THE_HILL: KingOfTheHill,
    CONDITIONAL_VICTORY: ConditionalVictory,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct KingOfTheHill {
    pub extension_time: u64,
    pub remaining_slots: u8,
    pub king: ContractAddress,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct ConditionalVictory {
    pub slots_required: u8
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
                        king: starknet::contract_address_const::<0x0>(),
                        remaining_slots: max_slots,
                    }
                )
            },
            JackpotMode::CONDITIONAL_VICTORY(params) => {
                assert!(params.slots_required <= max_slots, "slots_required exceeds max_slots");

                mode
            }
        }
    }
}



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
//             JackpotMode::CONDITIONAL_VICTORY(condition) => {
//                 if nums.len() >= (*condition.slots_required).into() {
//                     return true;
//                 }

//                 return false;
//             },
//             JackpotMode::KING_OF_THE_HILL(condition) => {
//                 if *condition.king == get_caller_address() {
//                     return true;
//                 }

//                 return false;
//             },
//         }
//     }
// }
