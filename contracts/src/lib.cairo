pub mod token;
pub mod random;
pub mod store;
pub mod constants;

pub use store::{Store, StoreImpl, StoreTrait};

pub mod systems {
    pub mod game_actions;
    pub mod claim_actions;
    pub mod jackpot_actions;
    pub mod config_actions;
}

pub mod models {
    pub mod game;
    pub mod slot;
    // pub mod claims;
    pub mod totals;
    pub mod config;
    pub mod jackpot;
    pub mod metadata;

    pub use game::{Game, GameImpl, GameTrait};
    pub use slot::Slot;
    // pub use claims::{Claims, TokenClaim, JackpotClaim, ClaimsType};
    pub use totals::{Totals, GlobalTotals};
    pub use config::{Config, GameConfig, SlotReward, RewardLevel, SlotRewardImpl, SlotRewardTrait};
    pub use jackpot::{
        Jackpot, JackpotMode, KingOfTheHill, ConditionalVictory, JackpotModeImpl, JackpotModeTrait,
        JackpotImpl, JackpotTrait,
    };
    pub use metadata::{Metadata};
}

pub mod interfaces {
    pub mod token;
    pub mod vrf;
    pub mod nums;
}

pub mod elements {
    pub mod achievements {
        pub mod interface;
        pub mod index;
        pub mod king;
        pub mod grinder;
        pub mod reference;
        pub mod filler;
        pub mod streak;
        pub mod claimer;
    }
    pub mod tasks {
        pub mod interface;
        pub mod index;
        pub mod king;
        pub mod grinder;
        pub mod reference;
        pub mod filler;
        pub mod streaker;
        pub mod claimer;
    }
}

pub mod tests {
    pub mod test_reward;
    pub mod test_game;
}

pub mod mocks {
    pub mod nums;
    pub mod reward;
    pub mod vrf;
}

pub const WORLD_RESOURCE: felt252 = 0;
