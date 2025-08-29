use nums::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait,
};

pub impl Streak of AchievementTrait {
    
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'STREAK_I',
            1 => 'STREAK_II',
            2 => 'STREAK_III',
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
        'Streak'
    }

    
    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-circle-2',
            1 => 'fa-circle-3',
            2 => 'fa-circle-4',
            _ => '',
        }
    }

    
    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Double Trouble',
            1 => 'Triple Threat',
            2 => 'Against All Odds',
            _ => '',
        }
    }

    
    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Coincidence or strategy? Either way, it's a streak!",
            1 => "Now you're getting into the rhythm!",
            2 => "A rare sight indeed! Fate must be on your side.",
            _ => "",
        }
    }

    
    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = 1;
        match level {
            0 => Task::StreakerOne.tasks(count),
            1 => Task::StreakerTwo.tasks(count),
            2 => Task::StreakerThree.tasks(count),
            _ => [].span(),
        }
    }
}
