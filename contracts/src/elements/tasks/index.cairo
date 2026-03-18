// External imports

use achievement::types::task::{Task as AchievementTask, TaskTrait as AchievementTaskTrait};

// Internal imports

use crate::elements::tasks;

// Types

#[derive(Copy, Drop, PartialEq)]
pub enum Task {
    None,
    // Quests
    Filler,
    Power,
    Trigger,
    Master,
    // Achievements
    Grinder,
    Claimer,
    ChainerOne,
    ChainerTwo,
    ChainerThree,
    ReferenceOne,
    ReferenceTwo,
    ReferenceThree,
    ReferenceFour,
    ReferenceFive,
    ReferenceSix,
    ReferenceSeven,
    FillerSixteen,
    FillerSeventeen,
    FillerEighteen,
    StreakerOne,
    StreakerTwo,
    StreakerThree,
}

// Implementations

#[generate_trait]
pub impl TaskImpl of TaskTrait {
    fn identifier(self: Task) -> felt252 {
        match self {
            Task::None => 0,
            Task::Filler => tasks::filler::Filler::identifier(),
            Task::Power => tasks::power::Power::identifier(),
            Task::Trigger => tasks::trigger::Trigger::identifier(),
            Task::Master => tasks::master::DailyMaster::identifier(),
            Task::Grinder => tasks::grinder::Grinder::identifier(),
            Task::Claimer => tasks::claimer::Claimer::identifier(),
            Task::ChainerOne => tasks::chainer::ChainerOne::identifier(),
            Task::ChainerTwo => tasks::chainer::ChainerTwo::identifier(),
            Task::ChainerThree => tasks::chainer::ChainerThree::identifier(),
            Task::ReferenceOne => tasks::reference::ReferenceOne::identifier(),
            Task::ReferenceTwo => tasks::reference::ReferenceTwo::identifier(),
            Task::ReferenceThree => tasks::reference::ReferenceThree::identifier(),
            Task::ReferenceFour => tasks::reference::ReferenceFour::identifier(),
            Task::ReferenceFive => tasks::reference::ReferenceFive::identifier(),
            Task::ReferenceSix => tasks::reference::ReferenceSix::identifier(),
            Task::ReferenceSeven => tasks::reference::ReferenceSeven::identifier(),
            Task::FillerSixteen => tasks::filler::FillerSixteen::identifier(),
            Task::FillerSeventeen => tasks::filler::FillerSeventeen::identifier(),
            Task::FillerEighteen => tasks::filler::FillerEighteen::identifier(),
            Task::StreakerOne => tasks::streaker::StreakerOne::identifier(),
            Task::StreakerTwo => tasks::streaker::StreakerTwo::identifier(),
            Task::StreakerThree => tasks::streaker::StreakerThree::identifier(),
        }
    }

    fn description(self: Task, count: u32) -> ByteArray {
        match self {
            Task::None => "",
            Task::Filler => tasks::filler::Filler::description(count),
            Task::Power => tasks::power::Power::description(count),
            Task::Trigger => tasks::trigger::Trigger::description(count),
            Task::Master => tasks::master::DailyMaster::description(count),
            Task::Grinder => tasks::grinder::Grinder::description(count),
            Task::Claimer => tasks::claimer::Claimer::description(count),
            Task::ChainerOne => tasks::chainer::ChainerOne::description(count),
            Task::ChainerTwo => tasks::chainer::ChainerTwo::description(count),
            Task::ChainerThree => tasks::chainer::ChainerThree::description(count),
            Task::ReferenceOne => tasks::reference::ReferenceOne::description(count),
            Task::ReferenceTwo => tasks::reference::ReferenceTwo::description(count),
            Task::ReferenceThree => tasks::reference::ReferenceThree::description(count),
            Task::ReferenceFour => tasks::reference::ReferenceFour::description(count),
            Task::ReferenceFive => tasks::reference::ReferenceFive::description(count),
            Task::ReferenceSix => tasks::reference::ReferenceSix::description(count),
            Task::ReferenceSeven => tasks::reference::ReferenceSeven::description(count),
            Task::FillerSixteen => tasks::filler::FillerSixteen::description(count),
            Task::FillerSeventeen => tasks::filler::FillerSeventeen::description(count),
            Task::FillerEighteen => tasks::filler::FillerEighteen::description(count),
            Task::StreakerOne => tasks::streaker::StreakerOne::description(count),
            Task::StreakerTwo => tasks::streaker::StreakerTwo::description(count),
            Task::StreakerThree => tasks::streaker::StreakerThree::description(count),
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
            Task::Filler => 1,
            Task::Power => 2,
            Task::Trigger => 3,
            Task::Master => 4,
            Task::Grinder => 5,
            Task::Claimer => 6,
            Task::ChainerOne => 7,
            Task::ChainerTwo => 8,
            Task::ChainerThree => 9,
            Task::ReferenceOne => 10,
            Task::ReferenceTwo => 11,
            Task::ReferenceThree => 12,
            Task::ReferenceFour => 13,
            Task::ReferenceFive => 14,
            Task::ReferenceSix => 15,
            Task::ReferenceSeven => 16,
            Task::FillerSixteen => 17,
            Task::FillerSeventeen => 18,
            Task::FillerEighteen => 19,
            Task::StreakerOne => 20,
            Task::StreakerTwo => 21,
            Task::StreakerThree => 22,
        }
    }
}

impl IntoU8Task of core::traits::Into<u8, Task> {
    fn into(self: u8) -> Task {
        let card: felt252 = self.into();
        match card {
            0 => Task::None,
            1 => Task::Filler,
            2 => Task::Power,
            3 => Task::Trigger,
            4 => Task::Master,
            5 => Task::Grinder,
            6 => Task::Claimer,
            7 => Task::ChainerOne,
            8 => Task::ChainerTwo,
            9 => Task::ChainerThree,
            10 => Task::ReferenceOne,
            11 => Task::ReferenceTwo,
            12 => Task::ReferenceThree,
            13 => Task::ReferenceFour,
            14 => Task::ReferenceFive,
            15 => Task::ReferenceSix,
            16 => Task::ReferenceSeven,
            17 => Task::FillerSixteen,
            18 => Task::FillerSeventeen,
            19 => Task::FillerEighteen,
            20 => Task::StreakerOne,
            21 => Task::StreakerTwo,
            22 => Task::StreakerThree,
            _ => Task::None,
        }
    }
}

