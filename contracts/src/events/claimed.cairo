pub use crate::events::index::Claimed;

#[generate_trait]
pub impl ClaimedImpl of ClaimedTrait {
    fn new(player_id: felt252, game_id: u64, reward: u64) -> Claimed {
        Claimed {
            player_id: player_id,
            game_id: game_id,
            reward: reward,
            time: starknet::get_block_timestamp(),
        }
    }
}
