use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::quests::contender::{DailyContenderThree, WeeklyContenderThree};
use crate::elements::quests::earner::{DailyEarnerThree, WeeklyEarnerThree};
use crate::elements::quests::placer::{DailyPlacerThree, WeeklyPlacerThree};
use super::index::{ICON, ONE_DAY, ONE_WEEK, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyFinisher of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_FINISHER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new(
            "Quest Reward", "800 NUMS and an exclusive achievement", ICON(),
        );
        let metadata = QuestMetadataTrait::new(
            name: "Daily Dominator",
            description: "You didn't just play the day. You conquered it.",
            icon: "fa-trophy",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 9, "Complete all the daily quests"),
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

pub impl WeeklyFinisher of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_FINISHER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let reward = RewardTrait::new(
            "Quest Reward", "4000 NUMS and an exclusive achievement", ICON(),
        );
        let metadata = QuestMetadataTrait::new(
            name: "Weekly Warlord",
            description: "A week well played is a week well won.",
            icon: "fa-shield-halved",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 9, "Complete all the weekly quests"),
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
