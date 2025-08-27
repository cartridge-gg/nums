pub mod token;
pub mod random;

pub mod systems {
    pub mod game_actions;
    pub mod claim_actions;
    pub mod jackpot_actions;
    pub mod config_actions;
}

pub mod models {
    pub mod game;
    pub mod slot;
    pub mod claims;
    pub mod totals;
    pub mod config;
    pub mod jackpot;
    pub mod metadata;
}

pub mod interfaces {
    pub mod token;
    pub mod vrf;
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

pub const WORLD_RESOURCE: felt252 = 0;