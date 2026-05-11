use starknet::ContractAddress;
pub use crate::events::index::{GameClaimApplied, PurchaseInitiated};

#[generate_trait]
pub impl PurchaseInitiatedImpl of PurchaseInitiatedTrait {
    fn new(
        purchase_id: u64, recipient: ContractAddress, bundle_id: u32, quantity: u32,
    ) -> PurchaseInitiated {
        PurchaseInitiated {
            purchase_id,
            recipient,
            bundle_id,
            quantity,
            time: starknet::get_block_timestamp(),
        }
    }
}

#[generate_trait]
pub impl GameClaimAppliedImpl of GameClaimAppliedTrait {
    fn new(
        purchase_id: u64,
        player: ContractAddress,
        level: u32,
        weight: u16,
        reward_amount: u128,
    ) -> GameClaimApplied {
        GameClaimApplied {
            purchase_id,
            player,
            level,
            weight,
            reward_amount,
            time: starknet::get_block_timestamp(),
        }
    }
}
