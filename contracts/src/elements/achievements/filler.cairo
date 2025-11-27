use crate::elements::achievements::interface::{AchievementTrait, ArcadeTask, Task, TaskTrait};

pub impl Filler of AchievementTrait {
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'FILLER_I',
            1 => 'FILLER_II',
            2 => 'FILLER_III',
            3 => 'FILLER_IV',
            4 => 'FILLER_V',
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
        'Filler'
    }

    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-battery-empty',
            1 => 'fa-battery-quarter',
            2 => 'fa-battery-half',
            3 => 'fa-battery-three-quarters',
            4 => 'fa-battery-full',
            _ => '',
        }
    }

    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Halfway There',
            1 => 'Stacking Up',
            2 => 'Close Call',
            3 => 'One Step Away',
            4 => 'Perfect Fit',
            _ => '',
        }
    }

    fn description(level: u8) -> ByteArray {
        match level {
            0 => "You're making progress, but there's still a long way to go.",
            1 => "You're getting the hang of it. Just a few more to go!",
            2 => "You're walking a tightrope. Will you make it to the end?",
            3 => "Perfection is within reach. Can you finish the job?",
            4 => "Flawless execution! You've mastered the game.",
            _ => "",
        }
    }

    fn tasks(level: u8) -> Span<ArcadeTask> {
        match level {
            0 => Task::FillerOne.tasks(10),
            1 => Task::FillerTwo.tasks(5),
            2 => Task::FillerThree.tasks(3),
            3 => Task::FillerFour.tasks(2),
            4 => Task::FillerFive.tasks(1),
            _ => [].span(),
        }
    }
}
