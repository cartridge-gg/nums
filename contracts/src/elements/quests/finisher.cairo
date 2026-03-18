use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use super::index::{ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyFinisher of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_FINISHER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Compliance",
            description: "All tasks have been completed to satisfaction.",
            icon: "fa-trophy",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 3, "Complete all the daily quests"),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: ONE_DAY,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
