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
        }
    }

    #[inline]
    fn description(self: Task, count: u32) -> ByteArray {
        match self {
            Task::None => "",
            Task::King => tasks::king::King::description(count),
            Task::Grinder => tasks::grinder::Grinder::description(count),
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
            _ => Task::None,
        }
    }
}

