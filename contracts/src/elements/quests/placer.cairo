use quest::types::reward::RewardTrait;
use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::filler;
use super::index::{ICON, ONE_DAY, ONE_WEEK, QuestMetadataTrait, QuestProps, QuestTrait};

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

pub impl WeeklyPlacerOne of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_PLACER_ONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 17;
        let reward = RewardTrait::new("Quest Reward", "1000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Precision Pilot",
            description: "You're threading the needle now.",
            icon: "fa-bullseye",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                filler::FillerSeventeen::identifier(),
                1,
                filler::FillerSeventeen::description(total),
            ),
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

pub impl WeeklyPlacerTwo of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_PLACER_TWO'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 18;
        let reward = RewardTrait::new("Quest Reward", "2000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Edge Runner",
            description: "One mistake and yeah, don't mistake.",
            icon: "fa-mountain",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                filler::FillerEighteen::identifier(), 1, filler::FillerEighteen::description(total),
            ),
        ];
        let conditions: Array<felt252> = array![WeeklyPlacerOne::identifier()];
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

pub impl WeeklyPlacerThree of QuestTrait {
    fn identifier() -> felt252 {
        'WEEKLY_PLACER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total = 19;
        let reward = RewardTrait::new("Quest Reward", "4000 NUMS", ICON());
        let metadata = QuestMetadataTrait::new(
            name: "Almost Perfect",
            description: "Nineteen out of twenty? Chef's kiss.",
            icon: "fa-star-half-stroke",
            registry: registry,
            rewards: array![reward].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                filler::FillerNineteen::identifier(), 1, filler::FillerNineteen::description(total),
            ),
        ];
        let conditions: Array<felt252> = array![WeeklyPlacerTwo::identifier()];
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
