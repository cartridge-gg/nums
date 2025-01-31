use nums_appchain::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait,
};

pub impl Streak of AchievementTrait {
    #[inline]
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'STREAK_I',
            1 => 'STREAK_II',
            2 => 'STREAK_III',
            _ => '',
        }
    }

    #[inline]
    fn index(level: u8) -> u8 {
        level
    }

    #[inline]
    fn hidden(level: u8) -> bool {
        false
    }

    #[inline]
    fn points(level: u8) -> u16 {
        match level {
            0 => 25,
            1 => 50,
            2 => 100,
            _ => 0,
        }
    }

    #[inline]
    fn group() -> felt252 {
        'Streak'
    }

    #[inline]
    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-circle-2',
            1 => 'fa-circle-3',
            2 => 'fa-circle-4',
            _ => '',
        }
    }

    #[inline]
    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Double Trouble',
            1 => 'Triple Threat',
            2 => 'Against All Odds',
            _ => '',
        }
    }

    #[inline]
    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Coincidence or strategy? Either way, it's a streak!",
            1 => "Now you're getting into the rhythm!",
            2 => "A rare sight indeed! Fate must be on your side.",
            _ => "",
        }
    }

    #[inline]
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
