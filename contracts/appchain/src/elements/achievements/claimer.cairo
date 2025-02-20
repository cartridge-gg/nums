use nums_appchain::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait,
};

pub impl Claimer of AchievementTrait {
    #[inline]
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
            0 => 30,
            1 => 40,
            2 => 100,
            3 => 200,
            4 => 300,
            _ => 0,
        }
    }

    #[inline]
    fn group() -> felt252 {
        'Claimer'
    }

    #[inline]
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

    #[inline]
    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Small Fry',
            1 => 'Rising Tide',
            2 => 'First Million',
            3 => 'Double Trouble',
            4 => 'Triple Crown',
            _ => '',
        }
    }

    #[inline]
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

    #[inline]
    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = match level {
            0 => 10_000,
            1 => 100_000,
            2 => 1_000_000,
            3 => 2_000_000,
            4 => 3_000_000,
            _ => 0,
        };
        Task::Claimer.tasks(count)
    }
}
