use starknet::ContractAddress;
use nums_starknet::models::token::Token;

#[derive(Copy, Drop, Serde, PartialEq)]
#[dojo::model]
pub struct Challenge {
    #[key]
    pub id: u32,
    pub title: felt252,
    pub creator: ContractAddress,
    pub mode: ChallengeMode,
    pub expiration: u64,
    pub token: Option<Token>,
    pub winner: Option<ContractAddress>,
    pub claimed: bool, // gql lacks ability to filter on winner Option, use bool for filtering on active challenges
    pub verified: bool,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct AppChain {
    pub message_contract: ContractAddress,
    pub to_address: ContractAddress,
    pub to_selector: felt252,
}


#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum ChallengeMode {
    KING_OF_THE_HILL: KingOfTheHill,
    CONDITIONAL_VICTORY: ConditionalVictory,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct KingOfTheHill {
    pub extension_time: u64,
    pub king: ContractAddress,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct ConditionalVictory {
    pub slots_required: u8
}

#[generate_trait]
pub impl ChallengeModeImpl of ChallengeModeTrait {
    fn new(mode: ChallengeMode, expiration: u64) -> ChallengeMode {
        match mode {
            ChallengeMode::KING_OF_THE_HILL(params) => {
                assert!(expiration != 0, "King of the Hill must have expiration");

                ChallengeMode::KING_OF_THE_HILL(
                    KingOfTheHill {
                        extension_time: params.extension_time,
                        king: starknet::contract_address_const::<0x0>(),
                    }
                )
            },
            ChallengeMode::CONDITIONAL_VICTORY(_) => {
                mode
            }
        }
    }
}



// #[generate_trait]
// pub impl ChallengeImpl of ChallengeTrait {
//     /// Determines if the challenge can be claimed based on the current game state.
//     ///
//     /// # Arguments
//     /// * `self` - A reference to the Challenge struct.
//     /// * `nums` - An array of numbers representing the current game state.
//     ///
//     /// # Returns
//     /// * `bool` - True if the challenge can be claimed, false otherwise.
//     fn can_claim(self: @Challenge, nums: @Array<u16>) -> bool {
//         match self.mode {
//             ChallengeMode::CONDITIONAL_VICTORY(condition) => {
//                 if nums.len() >= (*condition.slots_required).into() {
//                     return true;
//                 }

//                 return false;
//             },
//             ChallengeMode::KING_OF_THE_HILL(condition) => {
//                 if *condition.king == get_caller_address() {
//                     return true;
//                 }

//                 return false;
//             },
//         }
//     }
// }
