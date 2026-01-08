use crate::elements::achievements::interface::{AchievementTask, AchievementTrait, Task, TaskTrait};

pub impl Master of AchievementTrait {
    fn identifier(level: u8) -> felt252 {
        'MASTER'
    }

    fn index(level: u8) -> u8 {
        level
    }

    fn hidden(level: u8) -> bool {
        false
    }

    fn points(level: u8) -> u16 {
        100
    }

    fn group() -> felt252 {
        'Master'
    }

    fn icon(level: u8) -> felt252 {
        'fa-star-shooting'
    }

    fn title(level: u8) -> felt252 {
        'Daily Master'
    }

    fn description(level: u8) -> ByteArray {
        "You didn't just play the day. You conquered it."
    }

    fn tasks(level: u8) -> Span<AchievementTask> {
        Task::Master.tasks(1)
    }
}
