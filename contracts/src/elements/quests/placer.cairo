use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::filler;
use super::index::{ICON, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyPlacerOne of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_PLACER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 10;
        let reward = RewardTrait::new("Quest Reward", "200 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Halfway Hero",
            description: "10 down, 10 to go. Easy, right?",
            icon: "fa-bars-progress",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                filler::FillerTen::identifier(), 1, filler::FillerTen::description(total),
            ),
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

pub impl DailyPlacerTwo of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_PLACER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 13;
        let reward = RewardTrait::new("Quest Reward", "400 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Lucky Thirteen",
            description: "Unlucky for some. Not for you.",
            icon: "fa-hashtag",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                filler::FillerThirteen::identifier(), 1, filler::FillerThirteen::description(total),
            ),
        ];
        let conditions: Array<felt252> = array![DailyPlacerOne::identifier()];
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

pub impl DailyPlacerThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_PLACER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 16;
        let reward = RewardTrait::new("Quest Reward", "800 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Deep Diver",
            description: "You're really going all in, huh?",
            icon: "fa-layer-group",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                filler::FillerSixteen::identifier(), 1, filler::FillerSixteen::description(total),
            ),
        ];
        let conditions: Array<felt252> = array![DailyPlacerTwo::identifier()];
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
