pub use crate::constants::VAULT_LOCKUP_DURATION;
use crate::models::index::VaultPosition;

pub mod errors {
    pub const POSITION_IS_LOCKED: felt252 = 'VaultPosition: is locked';
}

#[generate_trait]
pub impl PositionImpl of PositionTrait {
    fn new(user: felt252) -> VaultPosition {
        VaultPosition { user: user, time_lock: 0, current_reward: 0, pending_reward: 0 }
    }

    fn claimable(self: @VaultPosition, shares: u256, total_reward: u256) -> u256 {
        *self.pending_reward + shares * (total_reward - *self.current_reward)
    }

    fn update(ref self: VaultPosition, shares: u256, total_reward: u256) {
        // [Effect] Update pending reward
        self.pending_reward = self.claimable(shares, total_reward);
        // [Effect] Update current reward
        self.current_reward = total_reward;
    }

    fn lock(ref self: VaultPosition, user: felt252) {
        // [Effect] Lock dividend
        self.time_lock = starknet::get_block_timestamp() + VAULT_LOCKUP_DURATION;
    }

    fn claim(ref self: VaultPosition, total_reward: u256) {
        // [Effect] Reset pending reward
        self.pending_reward = 0;
        // [Effect] Update current reward
        self.current_reward = total_reward;
    }
}

#[generate_trait]
pub impl PositionAssert of AssertTrait {
    fn assert_not_locked(self: @VaultPosition) {
        // [Info] It also prevents anyone to stake and unstake within a single block
        assert(self.time_lock < @starknet::get_block_timestamp(), errors::POSITION_IS_LOCKED);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
}
