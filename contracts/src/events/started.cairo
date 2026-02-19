pub use crate::events::index::Started;

#[generate_trait]
pub impl StartedImpl of StartedTrait {
    fn new(player_id: felt252, game_id: u64, multiplier: u8) -> Started {
        Started {
            player_id: player_id,
            game_id: game_id,
            multiplier: multiplier,
            time: starknet::get_block_timestamp(),
        }
    }
}
