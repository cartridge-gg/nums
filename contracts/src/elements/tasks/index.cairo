// External imports

use achievement::types::task::{Task as AchievementTask, TaskTrait as AchievementTaskTrait};

// Internal imports

use crate::elements::tasks;

// Types

#[derive(Copy, Drop, PartialEq)]
pub enum Task {
    None,
    KingOne,
    KingTwo,
    KingThree,
    Grinder,
    ReferenceOne,
    ReferenceTwo,
    ReferenceThree,
    ReferenceFour,
    ReferenceFive,
    ReferenceSix,
    ReferenceSeven,
    FillerOne,
    FillerTwo,
    FillerThree,
    FillerFour,
    FillerFive,
    FillerTen,
    FillerThirteen,
    FillerSixteen,
    FillerSeventeen,
    FillerEighteen,
    FillerNineteen,
    StreakerOne,
    StreakerTwo,
    StreakerThree,
    Claimer,
    Master,
}

// Implementations

#[generate_trait]
pub impl TaskImpl of TaskTrait {
    fn identifier(self: Task) -> felt252 {
        match self {
            Task::None => 0,
            Task::KingOne => tasks::king::KingOne::identifier(),
            Task::KingTwo => tasks::king::KingTwo::identifier(),
            Task::KingThree => tasks::king::KingThree::identifier(),
            Task::Grinder => tasks::grinder::Grinder::identifier(),
            Task::ReferenceOne => tasks::reference::ReferenceOne::identifier(),
            Task::ReferenceTwo => tasks::reference::ReferenceTwo::identifier(),
            Task::ReferenceThree => tasks::reference::ReferenceThree::identifier(),
            Task::ReferenceFour => tasks::reference::ReferenceFour::identifier(),
            Task::ReferenceFive => tasks::reference::ReferenceFive::identifier(),
            Task::ReferenceSix => tasks::reference::ReferenceSix::identifier(),
            Task::ReferenceSeven => tasks::reference::ReferenceSeven::identifier(),
            Task::FillerOne => tasks::filler::FillerOne::identifier(),
            Task::FillerTwo => tasks::filler::FillerTwo::identifier(),
            Task::FillerThree => tasks::filler::FillerThree::identifier(),
            Task::FillerFour => tasks::filler::FillerFour::identifier(),
            Task::FillerFive => tasks::filler::FillerFive::identifier(),
            Task::FillerTen => tasks::filler::FillerTen::identifier(),
            Task::FillerThirteen => tasks::filler::FillerThirteen::identifier(),
            Task::FillerSixteen => tasks::filler::FillerSixteen::identifier(),
            Task::FillerSeventeen => tasks::filler::FillerSeventeen::identifier(),
            Task::FillerEighteen => tasks::filler::FillerEighteen::identifier(),
            Task::FillerNineteen => tasks::filler::FillerNineteen::identifier(),
            Task::StreakerOne => tasks::streaker::StreakerOne::identifier(),
            Task::StreakerTwo => tasks::streaker::StreakerTwo::identifier(),
            Task::StreakerThree => tasks::streaker::StreakerThree::identifier(),
            Task::Claimer => tasks::claimer::Claimer::identifier(),
            Task::Master => tasks::master::DailyMaster::identifier(),
        }
    }

    fn description(self: Task, count: u32) -> ByteArray {
        match self {
            Task::None => "",
            Task::KingOne => tasks::king::KingOne::description(count),
            Task::KingTwo => tasks::king::KingTwo::description(count),
            Task::KingThree => tasks::king::KingThree::description(count),
            Task::Grinder => tasks::grinder::Grinder::description(count),
            Task::ReferenceOne => tasks::reference::ReferenceOne::description(count),
            Task::ReferenceTwo => tasks::reference::ReferenceTwo::description(count),
            Task::ReferenceThree => tasks::reference::ReferenceThree::description(count),
            Task::ReferenceFour => tasks::reference::ReferenceFour::description(count),
            Task::ReferenceFive => tasks::reference::ReferenceFive::description(count),
            Task::ReferenceSix => tasks::reference::ReferenceSix::description(count),
            Task::ReferenceSeven => tasks::reference::ReferenceSeven::description(count),
            Task::FillerOne => tasks::filler::FillerOne::description(count),
            Task::FillerTwo => tasks::filler::FillerTwo::description(count),
            Task::FillerThree => tasks::filler::FillerThree::description(count),
            Task::FillerFour => tasks::filler::FillerFour::description(count),
            Task::FillerFive => tasks::filler::FillerFive::description(count),
            Task::FillerTen => tasks::filler::FillerTen::description(count),
            Task::FillerThirteen => tasks::filler::FillerThirteen::description(count),
            Task::FillerSixteen => tasks::filler::FillerSixteen::description(count),
            Task::FillerSeventeen => tasks::filler::FillerSeventeen::description(count),
            Task::FillerEighteen => tasks::filler::FillerEighteen::description(count),
            Task::FillerNineteen => tasks::filler::FillerNineteen::description(count),
            Task::StreakerOne => tasks::streaker::StreakerOne::description(count),
            Task::StreakerTwo => tasks::streaker::StreakerTwo::description(count),
            Task::StreakerThree => tasks::streaker::StreakerThree::description(count),
            Task::Claimer => tasks::claimer::Claimer::description(count),
            Task::Master => tasks::master::DailyMaster::description(count),
        }
    }

    fn tasks(self: Task, count: u32) -> Span<AchievementTask> {
        let task_id: felt252 = self.identifier();
        let description: ByteArray = self.description(count);
        array![AchievementTaskTrait::new(task_id, count.into(), description)].span()
    }
}

impl IntoTaskU8 of core::traits::Into<Task, u8> {
    fn into(self: Task) -> u8 {
        match self {
            Task::None => 0,
            Task::KingOne => 1,
            Task::KingTwo => 2,
            Task::KingThree => 3,
            Task::Grinder => 4,
            Task::ReferenceOne => 5,
            Task::ReferenceTwo => 6,
            Task::ReferenceThree => 7,
            Task::ReferenceFour => 8,
            Task::ReferenceFive => 9,
            Task::ReferenceSix => 10,
            Task::ReferenceSeven => 11,
            Task::FillerOne => 12,
            Task::FillerTwo => 13,
            Task::FillerThree => 14,
            Task::FillerFour => 15,
            Task::FillerFive => 16,
            Task::FillerTen => 17,
            Task::FillerThirteen => 18,
            Task::FillerSixteen => 19,
            Task::FillerSeventeen => 20,
            Task::FillerEighteen => 21,
            Task::FillerNineteen => 22,
            Task::StreakerOne => 23,
            Task::StreakerTwo => 24,
            Task::StreakerThree => 25,
            Task::Claimer => 26,
            Task::Master => 27,
        }
    }
}

impl IntoU8Task of core::traits::Into<u8, Task> {
    fn into(self: u8) -> Task {
        let card: felt252 = self.into();
        match card {
            0 => Task::None,
            1 => Task::KingOne,
            2 => Task::KingTwo,
            3 => Task::KingThree,
            4 => Task::Grinder,
            5 => Task::ReferenceOne,
            6 => Task::ReferenceTwo,
            7 => Task::ReferenceThree,
            8 => Task::ReferenceFour,
            9 => Task::ReferenceFive,
            10 => Task::ReferenceSix,
            11 => Task::ReferenceSeven,
            12 => Task::FillerOne,
            13 => Task::FillerTwo,
            14 => Task::FillerThree,
            15 => Task::FillerFour,
            16 => Task::FillerFive,
            17 => Task::FillerTen,
            18 => Task::FillerThirteen,
            19 => Task::FillerSixteen,
            20 => Task::FillerSeventeen,
            21 => Task::FillerEighteen,
            22 => Task::FillerNineteen,
            23 => Task::StreakerOne,
            24 => Task::StreakerTwo,
            25 => Task::StreakerThree,
            26 => Task::Claimer,
            27 => Task::Master,
            _ => Task::None,
        }
    }
}

