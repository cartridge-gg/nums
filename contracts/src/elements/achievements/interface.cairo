pub use achievement::types::task::Task as ArcadeTask;
pub use crate::elements::tasks::index::{Task, TaskTrait};

pub trait AchievementTrait {
    fn identifier(level: u8) -> felt252;
    fn hidden(level: u8) -> bool;
    fn index(level: u8) -> u8;
    fn points(level: u8) -> u16;
    fn group() -> felt252;
    fn icon(level: u8) -> felt252;
    fn title(level: u8) -> felt252;
    fn description(level: u8) -> ByteArray;
    fn tasks(level: u8) -> Span<ArcadeTask>;
}
