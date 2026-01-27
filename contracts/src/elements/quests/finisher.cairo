use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::quests::contender::DailyContenderThree;
use crate::elements::quests::earner::DailyEarnerThree;
use crate::elements::quests::placer::DailyPlacerThree;
use super::index::{ICON, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyFinisher of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_FINISHER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let rewards = array![
            RewardTrait::new("Quest Reward", "800 NUMS", ICON()),
            RewardTrait::new("Quest Reward", "Exclusive achievement", "fa-medal"),
        ];
        let metadata = QuestMetadataTrait::new(
            name: "Daily Dominator",
            description: "You didn't just play the day. You conquered it.",
            icon: "fa-trophy",
            registry: registry,
            rewards: rewards.span(),
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
