pub use crate::events::index::Purchase;

#[generate_trait]
pub impl PurchaseImpl of PurchaseTrait {
    fn new(player_id: felt252, starterpack_id: u32, quantity: u32, multiplier: u8) -> Purchase {
        Purchase {
            player_id: player_id,
            starterpack_id: starterpack_id,
            quantity: quantity,
            multiplier: multiplier,
            time: starknet::get_block_timestamp(),
        }
    }
}
