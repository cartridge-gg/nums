pub mod constants;
pub mod store;

pub use store::{Store, StoreImpl, StoreTrait};

pub mod systems {
    pub mod collection;
    pub mod play;
    pub mod setup;
}

pub mod components {
    pub mod initializable;
    pub mod playable;
    pub mod starterpack;
}

pub mod models {
    pub mod config;
    pub mod game;
    pub mod index;
    pub mod starterpack;
}

pub mod events {
    pub mod index;
    pub mod purchase;
}

pub mod svg {
    pub mod complete;
    pub mod font;
    pub mod game_over;
    pub mod index;
    pub mod interface;
    pub mod new;
    pub mod progress;
}

pub mod helpers {
    pub mod bitmap;
    pub mod deck;
    pub mod heap;
    pub mod packer;
    pub mod power;
    pub mod random;
    pub mod rewarder;
    pub mod verifier;
}

pub mod assets {
    pub mod banner;
    pub mod icon;
}

pub mod types {
    pub mod metadata;
    pub mod power;
    pub mod svg;
    pub mod trap;
}

pub mod interfaces {
    pub mod erc20;
    pub mod erc721;
    pub mod nums;
    pub mod registry;
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
        pub mod master;
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
        pub mod master;
        pub mod reference;
        pub mod streaker;
    }
    pub mod traps {
        pub mod bomb;
        pub mod interface;
        pub mod lucky;
        pub mod magnet;
        pub mod slots;
        pub mod ufo;
        pub mod windy;
    }
    pub mod powers {
        pub mod double_up;
        pub mod foresight;
        pub mod halve;
        pub mod high;
        pub mod interface;
        pub mod low;
        pub mod mirror;
        pub mod reroll;
        pub mod swap;
    }
    pub mod quests {
        pub mod contender;
        pub mod earner;
        pub mod finisher;
        pub mod index;
        pub mod interface;
        pub mod placer;
    }
}

pub mod mocks {
    pub mod registry;
    pub mod token;
    pub mod vrf;
}

#[cfg(test)]
pub mod tests {
    pub mod setup;
    pub mod test_setup;
}

