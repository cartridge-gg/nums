// External imports

use achievement::types::task::{Task as ArcadeTask, TaskTrait as ArcadeTaskTrait};

// Internal imports

use nums_appchain::elements::tasks;

// Types

#[derive(Copy, Drop)]
pub enum Task {
    None,
    King,
    Grinder,
    Blackjack,
    Answer,
    Missing,
    Jackpot,
    Emergency,
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
            Task::Blackjack => tasks::blackjack::Blackjack::identifier(),
            Task::Answer => tasks::answer::Answer::identifier(),
            Task::Missing => tasks::missing::Missing::identifier(),
            Task::Jackpot => tasks::jackpot::Jackpot::identifier(),
            Task::Emergency => tasks::emergency::Emergency::identifier(),
        }
    }

    #[inline]
    fn description(self: Task, count: u32) -> ByteArray {
        match self {
            Task::None => "",
            Task::King => tasks::king::King::description(count),
            Task::Grinder => tasks::grinder::Grinder::description(count),
            Task::Blackjack => tasks::blackjack::Blackjack::description(count),
            Task::Answer => tasks::answer::Answer::description(count),
            Task::Missing => tasks::missing::Missing::description(count),
            Task::Jackpot => tasks::jackpot::Jackpot::description(count),
            Task::Emergency => tasks::emergency::Emergency::description(count),
        }
    }

    #[inline]
    fn tasks(self: Task, count: u32) -> Span<ArcadeTask> {
        let task_id: felt252 = self.identifier();
        let description: ByteArray = self.description(count);
        array![ArcadeTaskTrait::new(task_id, count, description)].span()
    }
}

impl IntoTaskU8 of core::traits::Into<Task, u8> {
    #[inline]
    fn into(self: Task) -> u8 {
        match self {
            Task::None => 0,
            Task::King => 1,
            Task::Grinder => 2,
            Task::Blackjack => 3,
            Task::Answer => 4,
            Task::Missing => 5,
            Task::Jackpot => 6,
            Task::Emergency => 7,
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
            3 => Task::Blackjack,
            4 => Task::Answer,
            5 => Task::Missing,
            6 => Task::Jackpot,
            7 => Task::Emergency,
            _ => Task::None,
        }
    }
}

