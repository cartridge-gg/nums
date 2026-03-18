pub use crate::helpers::packer::Packer;
pub use crate::helpers::random::{Random, RandomTrait};
pub use crate::models::game::{Game, GameTrait};
pub use crate::types::trap::Trap;

pub trait TrapTrait {
    fn apply(ref game: Game, slot_index: u8, ref rand: Random, ref traps: Array<Trap>);
}
