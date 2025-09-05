use nums::elements::achievements::interface::{AchievementTrait, ArcadeTask, Task, TaskTrait};

pub impl Grinder of AchievementTrait {
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'GRINDER_I',
            1 => 'GRINDER_II',
            2 => 'GRINDER_III',
            3 => 'GRINDER_IV',
            4 => 'GRINDER_V',
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
            0 => 30,
            1 => 40,
            2 => 50,
            3 => 60,
            4 => 70,
            _ => 0,
        }
    }


    fn group() -> felt252 {
        'Grinder'
    }


    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-clock-two',
            1 => 'fa-clock-three',
            2 => 'fa-clock-six',
            3 => 'fa-clock-nine',
            4 => 'fa-clock-ten',
            _ => '',
        }
    }


    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Novice',
            1 => 'Apprentice',
            2 => 'Hardened',
            3 => 'Unstoppable',
            4 => 'Legend',
            _ => '',
        }
    }


    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Every journey begins with a single step.",
            1 => "Repetition is the mother of skill.",
            2 => "What you do repeatedly, you become.",
            3 => "Obsessed is just a word the lazy use to describe the dedicated.",
            4 => "Some people dream of success, others grind for it.",
            _ => "",
        }
    }


    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = match level {
            0 => 25,
            1 => 50,
            2 => 100,
            3 => 250,
            4 => 500,
            _ => 0,
        };
        Task::Grinder.tasks(count)
    }
}
