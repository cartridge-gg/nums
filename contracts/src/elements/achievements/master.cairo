use crate::elements::achievements::interface::{AchievementTask, AchievementTrait, Task, TaskTrait};

pub impl Master of AchievementTrait {
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'MASTER_I',
            1 => 'MASTER_II',
            _ => '',
        }
    }

    fn index(level: u8) -> u8 {
        level
    }

    fn hidden(level: u8) -> bool {
        false
    }

    fn points(level: u8) -> u16 {
        match level {
            0 => 100,
            1 => 100,
            _ => 0,
        }
    }

    fn group() -> felt252 {
        'Master'
    }

    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-star-shooting',
            1 => 'fa-meteor',
            _ => '',
        }
    }

    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Daily Master',
            1 => 'Weekly Master',
            _ => '',
        }
    }

    fn description(level: u8) -> ByteArray {
        match level {
            0 => "You didn't just play the day. You conquered it.",
            1 => "A week well played is a week well won.",
            _ => "",
        }
    }

    fn tasks(level: u8) -> Span<AchievementTask> {
        match level {
            0 => Task::MasterOne.tasks(1),
            1 => Task::MasterTwo.tasks(1),
            _ => [].span(),
        }
    }
}
