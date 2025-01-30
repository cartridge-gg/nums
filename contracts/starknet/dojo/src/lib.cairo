pub mod systems {
    pub mod message_consumers;
    pub mod jackpot_actions;
    pub mod config_actions;
}

pub mod models {
    pub mod metadata;
    pub mod message;
    pub mod claims;
}

pub mod interfaces {
    pub mod token;
    pub mod messaging;
}

pub mod tests {}

