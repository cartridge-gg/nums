use nums::elements::achievements::interface::{AchievementTrait, ArcadeTask, Task, TaskTrait};

pub impl Reference of AchievementTrait {
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'REFERENCE_I',
            1 => 'REFERENCE_II',
            2 => 'REFERENCE_III',
            3 => 'REFERENCE_IV',
            4 => 'REFERENCE_V',
            5 => 'REFERENCE_VI',
            6 => 'REFERENCE_VII',
            _ => '',
        }
    }


    fn index(level: u8) -> u8 {
        0
    }


    fn hidden(level: u8) -> bool {
        true
    }


    fn points(level: u8) -> u16 {
        match level {
            0 => 10,
            1 => 10,
            2 => 10,
            3 => 10,
            4 => 10,
            5 => 10,
            6 => 10,
            _ => 0,
        }
    }


    fn group() -> felt252 {
        'Numbers'
    }


    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-cards',
            1 => 'fa-comment',
            2 => 'fa-circle-question',
            3 => 'fa-slot-machine',
            4 => 'fa-siren-on',
            5 => 'fa-joint',
            6 => 'fa-face-smirking',
            _ => '',
        }
    }


    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Blackjack Master',
            1 => 'The Answer',
            2 => 'Achievement not found',
            3 => 'Jackpot!',
            4 => 'Emergency Mode',
            5 => 'Meme Lord',
            6 => 'Nice',
            _ => '',
        }
    }


    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Hit or stand, you know how to play the odds.",
            1 => "Life, the Universe, and Everything. You figured it out.",
            2 => "Oops... Looks like you took a wrong turn.",
            3 => "Luck is on your side. Keep spinning!",
            4 => "This is not a drill! Time to act fast.",
            5 => "420 blaze it!",
            6 => "Oh yeaaah",
            _ => "",
        }
    }


    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = 1;
        match level {
            0 => Task::ReferenceOne.tasks(count),
            1 => Task::ReferenceTwo.tasks(count),
            2 => Task::ReferenceThree.tasks(count),
            3 => Task::ReferenceFour.tasks(count),
            4 => Task::ReferenceFive.tasks(count),
            5 => Task::ReferenceSix.tasks(count),
            6 => Task::ReferenceSeven.tasks(count),
            _ => [].span(),
        }
    }
}
