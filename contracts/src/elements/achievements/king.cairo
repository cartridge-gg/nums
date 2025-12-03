use crate::elements::achievements::interface::{AchievementTask, AchievementTrait, Task, TaskTrait};

pub impl King of AchievementTrait {
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'KOTH_I',
            1 => 'KOTH_II',
            2 => 'KOTH_III',
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
            0 => 25,
            1 => 75,
            2 => 100,
            _ => 0,
        }
    }

    fn group() -> felt252 {
        'King of the Hill'
    }

    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-chess-bishop',
            1 => 'fa-chess-rook',
            2 => 'fa-chess-king',
            _ => '',
        }
    }

    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Expert',
            1 => 'Veteran',
            2 => 'King',
            _ => '',
        }
    }

    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Practice makes perfect.",
            1 => "Endurance is patience concentrated.",
            2 => "Heavy is the head that wears the crown.",
            _ => "",
        }
    }

    fn tasks(level: u8) -> Span<AchievementTask> {
        match level {
            0 => Task::KingOne.tasks(1),
            1 => Task::KingTwo.tasks(1),
            2 => Task::KingThree.tasks(1),
            _ => [].span(),
        }
    }
}
