use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::claimer::Claimer;
use super::index::{ICON, ONE_DAY, ONE_WEEK, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyEarnerOne of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_EARNER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 2000;
        let reward = RewardTrait::new("Quest Reward", "200 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Coin Collector",
            description: "A little coin never hurts anybody.",
            icon: "fa-coins",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Claimer::identifier(), total.into(), Claimer::description(total)),
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

pub impl DailyEarnerTwo of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_EARNER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 5000;
        let reward = RewardTrait::new("Quest Reward", "400 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Stack Builder",
            description: "Thats not a bag. That's a start.",
            icon: "fa-piggy-bank",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Claimer::identifier(), total.into(), Claimer::description(total)),
        ];
        let conditions: Array<felt252> = array![DailyEarnerOne::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: ONE_DAY,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}

pub impl DailyEarnerThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_EARNER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 10_000;
        let reward = RewardTrait::new("Quest Reward", "800 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Money Maker",
            description: "If it jingles, it's working.",
            icon: "fa-sack-dollar",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Claimer::identifier(), total.into(), Claimer::description(total)),
        ];
        let conditions: Array<felt252> = array![DailyEarnerTwo::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: ONE_DAY,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}

pub impl WeeklyEarnerOne of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_EARNER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 20_000;
        let reward = RewardTrait::new("Quest Reward", "1000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Bank Booster",
            description: "Your pockets are getting heavier.",
            icon: "fa-money-bill-wave",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Claimer::identifier(), total.into(), Claimer::description(total)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_WEEK,
            interval: ONE_WEEK,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl WeeklyEarnerTwo of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_EARNER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 50_000;
        let reward = RewardTrait::new("Quest Reward", "2000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Num Tycoon",
            description: "Money talks. Yours screams.",
            icon: "fa-vault",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Claimer::identifier(), total.into(), Claimer::description(total)),
        ];
        let conditions: Array<felt252> = array![WeeklyEarnerOne::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_WEEK,
            interval: ONE_WEEK,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}

pub impl WeeklyEarnerThree of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_EARNER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 100_000;
        let reward = RewardTrait::new("Quest Reward", "4000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Fortune Founder",
            description: "You're basically printing money now.",
            icon: "fa-gem",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Claimer::identifier(), total.into(), Claimer::description(total)),
        ];
        let conditions: Array<felt252> = array![WeeklyEarnerTwo::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_WEEK,
            interval: ONE_WEEK,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}
