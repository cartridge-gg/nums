pub use crate::models::index::VaultInfo;

pub mod errors {
    pub const VAULT_IS_CLOSED: felt252 = 'Vault: is closed';
    pub const VAULT_IS_OPEN: felt252 = 'Vault: is open';
    pub const VAULT_INVALID_FEE: felt252 = 'Vault: invalid fee';
}

#[generate_trait]
pub impl VaultImpl of VaultTrait {
    fn new(world_resource: felt252, open: bool, fee: u16) -> VaultInfo {
        VaultInfo { world_resource: world_resource, open: open, fee: fee, total_reward: 0 }
    }

    fn add(ref self: VaultInfo, reward: u256) {
        self.total_reward += reward;
    }

    fn open(ref self: VaultInfo) {
        self.open = true;
    }

    fn close(ref self: VaultInfo) {
        self.open = false;
    }

    fn set_fee(ref self: VaultInfo, fee: u16) {
        // [Check] Fee range
        assert(fee <= 10_000, errors::VAULT_INVALID_FEE);
        self.fee = fee;
    }
}

#[generate_trait]
pub impl VaultAssert of AssertTrait {
    fn assert_is_open(self: @VaultInfo) {
        // [Check] Vault is open
        assert(*self.open, errors::VAULT_IS_CLOSED);
    }

    fn assert_is_closed(self: @VaultInfo) {
        // [Check] Vault is closed
        assert(!*self.open, errors::VAULT_IS_OPEN);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
}
