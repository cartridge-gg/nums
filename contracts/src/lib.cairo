pub mod constants;
pub mod random;
pub mod store;
pub mod token;

pub use store::{Store, StoreImpl, StoreTrait};

pub mod systems {
    pub mod config_actions;
    pub mod game_actions;
    pub mod jackpot_actions;
}

pub mod models {
    pub mod config;
    pub mod game;
    pub mod identifier;
    pub mod jackpot;
    pub mod metadata;
    pub mod slot;

    pub use config::{Config, ConfigImpl, ConfigTrait, GameConfig};
    pub use game::{Game, GameImpl, GameTrait};
    pub use identifier::Identifier;
    pub use jackpot::{
        CreateJackpotFactoryParams, Jackpot, JackpotFactory, JackpotFactoryImpl,
        JackpotFactoryTrait, JackpotMode, JackpotWinner, TimingMode,
    };
    pub use metadata::Metadata;
    pub use slot::Slot;
}

pub mod interfaces {
    pub mod erc20;
    pub mod erc721;
    pub mod nums;
    pub mod token;
    pub mod vrf;
}

pub mod elements {
    pub mod achievements {
        pub mod claimer;
        pub mod filler;
        pub mod grinder;
        pub mod index;
        pub mod interface;
        pub mod king;
        pub mod reference;
        pub mod streak;
    }
    pub mod tasks {
        pub mod claimer;
        pub mod filler;
        pub mod grinder;
        pub mod index;
        pub mod interface;
        pub mod king;
        pub mod reference;
        pub mod streaker;
    }
}

pub mod tests {
    pub mod test_game;
    pub mod test_reward;
}

pub mod mocks {
    pub mod nums;
    pub mod reward;
    pub mod vrf;
}

pub const WORLD_RESOURCE: felt252 = 0;
