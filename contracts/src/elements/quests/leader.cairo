use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use crate::elements::quests::contender::DailyContenderThree;
use crate::elements::quests::earner::DailyEarnerThree;
use crate::elements::quests::placer::DailyPlacerThree;
use super::index::{ICON, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl LeaderOne of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_LEADER_ONE'
    }

    fn props() -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "Exclusive achievement", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Bronze Hero",
            description: "Top 5? You're officially dangerous.",
            icon: "fa-medal",
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Claim a Top5 prize or above"),
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

pub impl LeaderTwo of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_LEADER_TWO'
    }

    fn props() -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "Exclusive achievement", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Silver Master",
            description: "Podium secured. Flex responsibly.",
            icon: "fa-award",
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Claim a Top3 prize or above"),
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

pub impl LeaderThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_LEADER_THREE'
    }

    fn props() -> QuestProps {
        let reward = RewardTrait::new("Quest Reward", "Exclusive achievement", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Golden Legend",
            description: "There can be only one. Today, it's you.",
            icon: "fa-crown",
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 1, "Claim a Top1 prize"),
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
