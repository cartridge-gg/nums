use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::quests::contender::DailyContenderThree;
use crate::elements::quests::earner::DailyEarnerThree;
use crate::elements::quests::placer::DailyPlacerThree;
use super::index::{ICON, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl StarterOne of QuestTrait {
    fn identifier() -> felt252 {
        'PERMANENT_STARTER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "200 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "First Steps",
            description: "Every journey starts with... clicking play.",
            icon: "fa-shoe-prints",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Claim a game"),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl StarterTwo of QuestTrait {
    fn identifier() -> felt252 {
        'PERMANENT_STARTER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "300 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Power Surge",
            description: "Choose wisely. Or just choose quickly.",
            icon: "fa-bolt",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Select your powers and start a game"),
        ];
        let conditions: Array<felt252> = array![StarterOne::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}

pub impl StarterThree of QuestTrait {
    fn identifier() -> felt252 {
        'PERMANENT_STARTER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "400 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "The First Drop",
            description: "And so the chaos begins.",
            icon: "fa-hand-pointer",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Place your first number"),
        ];
        let conditions: Array<felt252> = array![StarterTwo::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}

pub impl StarterFour of QuestTrait {
    fn identifier() -> felt252 {
        'PERMANENT_STARTER_FOUR'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "500 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Chasing Coins",
            description: "The first earn hits different.",
            icon: "fa-circle-dollar-to-slot",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Earn your first Nums"),
        ];
        let conditions: Array<felt252> = array![StarterThree::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}

pub impl StarterFive of QuestTrait {
    fn identifier() -> felt252 {
        'PERMANENT_STARTER_FIVE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "600 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "The Completionist",
            description: "Start strong. Finish stronger.",
            icon: "fa-flag-checkered",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Reach the game's end"),
        ];
        let conditions: Array<felt252> = array![StarterFour::identifier()];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }
}
