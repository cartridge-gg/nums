// External imports

use achievement::types::task::{Task as ArcadeTask, TaskTrait as ArcadeTaskTrait};

// Internal imports

use nums::elements::tasks;

// Types

#[derive(Copy, Drop)]
pub enum Task {
    None,
    King,
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
    StreakerOne,
    StreakerTwo,
    StreakerThree,
    Claimer,
}

// Implementations

#[generate_trait]
pub impl TaskImpl of TaskTrait {
    #[inline]
    fn identifier(self: Task) -> felt252 {
        match self {
            Task::None => 0,
            Task::King => tasks::king::King::identifier(),
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
            Task::StreakerOne => tasks::streaker::StreakerOne::identifier(),
            Task::StreakerTwo => tasks::streaker::StreakerTwo::identifier(),
            Task::StreakerThree => tasks::streaker::StreakerThree::identifier(),
            Task::Claimer => tasks::claimer::Claimer::identifier(),
        }
    }

    #[inline]
    fn description(self: Task, count: u32) -> ByteArray {
        match self {
            Task::None => "",
            Task::King => tasks::king::King::description(count),
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
            Task::StreakerOne => tasks::streaker::StreakerOne::description(count),
            Task::StreakerTwo => tasks::streaker::StreakerTwo::description(count),
            Task::StreakerThree => tasks::streaker::StreakerThree::description(count),
            Task::Claimer => tasks::claimer::Claimer::description(count),
        }
    }

    #[inline]
    fn tasks(self: Task, count: u32) -> Span<ArcadeTask> {
        let task_id: felt252 = self.identifier();
        let description: ByteArray = self.description(count);
        array![ArcadeTaskTrait::new(task_id, count.into(), description)].span()
    }
}

impl IntoTaskU8 of core::traits::Into<Task, u8> {
    #[inline]
    fn into(self: Task) -> u8 {
        match self {
            Task::None => 0,
            Task::King => 1,
            Task::Grinder => 2,
            Task::ReferenceOne => 3,
            Task::ReferenceTwo => 4,
            Task::ReferenceThree => 5,
            Task::ReferenceFour => 6,
            Task::ReferenceFive => 7,
            Task::ReferenceSix => 8,
            Task::ReferenceSeven => 9,
            Task::FillerOne => 10,
            Task::FillerTwo => 11,
            Task::FillerThree => 12,
            Task::FillerFour => 13,
            Task::FillerFive => 14,
            Task::StreakerOne => 15,
            Task::StreakerTwo => 16,
            Task::StreakerThree => 17,
            Task::Claimer => 18,
        }
    }
}

impl IntoU8Task of core::traits::Into<u8, Task> {
    #[inline]
    fn into(self: u8) -> Task {
        let card: felt252 = self.into();
        match card {
            0 => Task::None,
            1 => Task::King,
            2 => Task::Grinder,
            3 => Task::ReferenceOne,
            4 => Task::ReferenceTwo,
            5 => Task::ReferenceThree,
            6 => Task::ReferenceFour,
            7 => Task::ReferenceFive,
            8 => Task::ReferenceSix,
            9 => Task::ReferenceSeven,
            10 => Task::FillerOne,
            11 => Task::FillerTwo,
            12 => Task::FillerThree,
            13 => Task::FillerFour,
            14 => Task::FillerFive,
            15 => Task::StreakerOne,
            16 => Task::StreakerTwo,
            17 => Task::StreakerThree,
            18 => Task::Claimer,
            _ => Task::None,
        }
    }
}

