use nums_appchain::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait
};

pub impl Reference of AchievementTrait {
    #[inline]
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'REFERENCE_I',
            1 => 'REFERENCE_II',
            2 => 'REFERENCE_III',
            3 => 'REFERENCE_IV',
            4 => 'REFERENCE_V',
            _ => '',
        }
    }

    #[inline]
    fn index(level: u8) -> u8 {
        level
    }

    #[inline]
    fn hidden(level: u8) -> bool {
        true
    }

    #[inline]
    fn points(level: u8) -> u16 {
        match level {
            0 => 10,
            1 => 10,
            2 => 10,
            3 => 10,
            4 => 10,
            _ => 0,
        }
    }

    #[inline]
    fn group() -> felt252 {
        'Numbers'
    }

    #[inline]
    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-cards',
            1 => 'fa-comment',
            2 => 'fa-circle-question',
            3 => 'fa-slot-machine',
            4 => 'fa-siren-on',
            _ => '',
        }
    }

    #[inline]
    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Blackjack Master',
            1 => 'The Answer',
            2 => 'Achievement not found',
            3 => 'Jackpot!',
            4 => 'Emergency Mode',
            _ => '',
        }
    }

    #[inline]
    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Hit or stand, you know how to play the odds.",
            1 => "Life, the Universe, and Everything. You figured it out.",
            2 => "Oops... Looks like you took a wrong turn.",
            3 => "Luck is on your side. Keep spinning!",
            4 => "This is not a drill! Time to act fast.",
            _ => "",
        }
    }

    #[inline]
    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = 1;
        match level {
            0 => Task::Blackjack.tasks(count),
            1 => Task::Answer.tasks(count),
            2 => Task::Missing.tasks(count),
            3 => Task::Jackpot.tasks(count),
            4 => Task::Emergency.tasks(count),
            _ => [].span(),
        }
    }
}
