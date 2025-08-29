use nums::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait,
};

pub impl Claimer of AchievementTrait {
    
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'CLAIMER_I',
            1 => 'CLAIMER_II',
            2 => 'CLAIMER_III',
            3 => 'CLAIMER_IV',
            4 => 'CLAIMER_V',
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
        'Claimer'
    }

    
    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-shrimp',
            1 => 'fa-fish-fins',
            2 => 'fa-dolphin',
            3 => 'fa-whale',
            4 => 'fa-narwhal',
            _ => '',
        }
    }

    
    fn title(level: u8) -> felt252 {
        match level {
            0 => 'First Million',
            1 => 'Double Up',
            2 => 'Money Machine',
            3 => 'Rolling in Gold',
            4 => 'Untouchable',
            _ => '',
        }
    }

    
    fn description(level: u8) -> ByteArray {
        match level {
            0 => "The first step to fortune. Just a few more to go!",
            1 => "Twice the riches, twice the glory!",
            2 => "You're stacking up wealth at an impressive pace!",
            3 => "You're not just rich, you're thriving!",
            4 => "Wealth beyond imagination. You've reached the elite.",
            _ => "",
        }
    }

    
    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = match level {
            0 => 1000000,
            1 => 2000000,
            2 => 4000000,
            3 => 8000000,
            4 => 16000000,
            _ => 0,
        };
        Task::Claimer.tasks(count)
    }
}
