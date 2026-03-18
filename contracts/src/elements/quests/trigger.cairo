use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::trigger;
use super::index::{ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait, THREE_DAYS, TWO_DAYS};

pub impl DailyTriggerOne of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_TRIGGER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 6;
        let metadata = QuestMetadataTrait::new(
            name: "Risk Assessment",
            description: "Every stumble is a step forward.",
            icon: "fa-bomb",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                trigger::Trigger::identifier(), total.into(), trigger::Trigger::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: TWO_DAYS,
            end: 0,
            duration: ONE_DAY,
            interval: THREE_DAYS,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl DailyTriggerTwo of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_TRIGGER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 9;
        let metadata = QuestMetadataTrait::new(
            name: "Stress Test",
            description: "What does not break you is just getting started.",
            icon: "fa-explosion",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                trigger::Trigger::identifier(), total.into(), trigger::Trigger::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: THREE_DAYS,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl DailyTriggerThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_TRIGGER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 12;
        let metadata = QuestMetadataTrait::new(
            name: "Controlled Burn",
            description: "Order through chaos.",
            icon: "fa-land-mine-on",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                trigger::Trigger::identifier(), total.into(), trigger::Trigger::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: THREE_DAYS,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
