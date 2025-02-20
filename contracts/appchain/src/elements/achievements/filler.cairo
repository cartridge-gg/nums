use nums_appchain::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait,
};

pub impl Filler of AchievementTrait {
    #[inline]
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
            0 => 20,
            1 => 50,
            2 => 100,
            3 => 500,
            4 => 10000,
            _ => 0,
        }
    }

    #[inline]
    fn group() -> felt252 {
        'Filler'
    }

    #[inline]
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

    #[inline]
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

    #[inline]
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

    #[inline]
    fn tasks(level: u8) -> Span<ArcadeTask> {
        match level {
            0 => Task::FillerOne.tasks(5),
            1 => Task::FillerTwo.tasks(4),
            2 => Task::FillerThree.tasks(3),
            3 => Task::FillerFour.tasks(2),
            4 => Task::FillerFive.tasks(1),
            _ => [].span(),
        }
    }
}
