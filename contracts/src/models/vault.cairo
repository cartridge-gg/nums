pub use crate::models::index::VaultInfo;

pub mod errors {}

#[generate_trait]
pub impl VaultImpl of VaultTrait {
    fn new(world_resource: felt252, open: bool) -> VaultInfo {
        VaultInfo { world_resource: world_resource, open: open, total_reward: 0 }
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
}

#[cfg(test)]
mod tests {
    use super::*;
}
