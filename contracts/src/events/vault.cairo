pub use crate::events::index::{VaultClaimed, VaultPaid};

#[generate_trait]
pub impl VaultClaimedImpl of VaultClaimedTrait {
    fn new(user: felt252, amount: u256) -> VaultClaimed {
        VaultClaimed { user: user, amount: amount, time: starknet::get_block_timestamp() }
    }
}

#[generate_trait]
pub impl VaultPaidImpl of VaultPaidTrait {
    fn new(player_id: felt252, amount: u256) -> VaultPaid {
        VaultPaid { player_id: player_id, amount: amount, time: starknet::get_block_timestamp() }
    }
}
