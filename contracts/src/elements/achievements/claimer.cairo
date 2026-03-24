use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl ClaimerOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CLAIMER_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Petty Cash',
            description: "A small reward for honest work.",
            icon: 'fa-coins',
            points: 15,
            hidden: false,
            index: 0,
            group: 'Claimer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Claimer.tasks(10_000), metadata: metadata,
        }
    }
}

pub impl ClaimerTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CLAIMER_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Bonus Package',
            description: "A handshake is available upon request.",
            icon: 'fa-sack-dollar',
            points: 30,
            hidden: false,
            index: 1,
            group: 'Claimer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Claimer.tasks(50_000), metadata: metadata,
        }
    }
}

pub impl ClaimerThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CLAIMER_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Golden Parachute',
            description: "Coveted as a fixed star.",
            icon: 'fa-crown',
            points: 55,
            hidden: false,
            index: 2,
            group: 'Claimer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Claimer.tasks(100_000), metadata: metadata,
        }
    }
}
