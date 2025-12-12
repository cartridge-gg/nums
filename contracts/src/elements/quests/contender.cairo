use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::grinder::Grinder;
use super::index::{ICON, ONE_DAY, ONE_WEEK, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyContenderOne of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_CONTENDER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 1;
        let reward = RewardTrait::new("Quest Reward", "200 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Warm-Up Run",
            description: "One game a day keeps the boredom away.",
            icon: "fa-play",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Grinder::identifier(), total.into(), Grinder::description(total)),
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

pub impl DailyContenderTwo of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_CONTENDER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 3;
        let reward = RewardTrait::new("Quest Reward", "400 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Triple Trouble",
            description: "Because one is never enough.",
            icon: "fa-dice",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Grinder::identifier(), total.into(), Grinder::description(total)),
        ];
        let conditions: Array<felt252> = array![DailyContenderOne::identifier()];
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

pub impl DailyContenderThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_CONTENDER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 5;
        let reward = RewardTrait::new("Quest Reward", "800 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Game Grinder",
            description: "Five shots, no misses. Hopefully.",
            icon: "fa-fire",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Grinder::identifier(), total.into(), Grinder::description(total)),
        ];
        let conditions: Array<felt252> = array![DailyContenderTwo::identifier()];
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

pub impl WeeklyContenderOne of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_CONTENDER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 10;
        let reward = RewardTrait::new("Quest Reward", "1000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Tenacity",
            description: "Ten games? That's just Monday for you.",
            icon: "fa-forward",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Grinder::identifier(), total.into(), Grinder::description(total)),
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

pub impl WeeklyContenderTwo of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_CONTENDER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 30;
        let reward = RewardTrait::new("Quest Reward", "2000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Thirty Thruster",
            description: "When in doubt, play it out.",
            icon: "fa-rocket",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Grinder::identifier(), total.into(), Grinder::description(total)),
        ];
        let conditions: Array<felt252> = array![WeeklyContenderOne::identifier()];
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

pub impl WeeklyContenderThree of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_CONTENDER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 50;
        let reward = RewardTrait::new("Quest Reward", "4000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Weekend Warrior",
            description: "Fifty games. Touch grass later.",
            icon: "fa-chess-knight",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Grinder::identifier(), total.into(), Grinder::description(total)),
        ];
        let conditions: Array<felt252> = array![WeeklyContenderTwo::identifier()];
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
