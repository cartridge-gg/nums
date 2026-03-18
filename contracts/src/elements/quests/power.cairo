use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::power;
use super::index::{ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait, THREE_DAYS, TWO_DAYS};

pub impl DailyPowerOne of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_POWER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 4;
        let metadata = QuestMetadataTrait::new(
            name: "Boost",
            description: "A little boost never hurt anyone.",
            icon: "fa-bolt",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                power::Power::identifier(), total.into(), power::Power::description(total),
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

pub impl DailyPowerTwo of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_POWER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 6;
        let metadata = QuestMetadataTrait::new(
            name: "Override",
            description: "Sometimes the rules need bending.",
            icon: "fa-bolt-lightning",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                power::Power::identifier(), total.into(), power::Power::description(total),
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

pub impl DailyPowerThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_POWER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 8;
        let metadata = QuestMetadataTrait::new(
            name: "Full Surge",
            description: "All systems, go.",
            icon: "fa-wand-magic-sparkles",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                power::Power::identifier(), total.into(), power::Power::description(total),
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
