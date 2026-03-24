use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl StreakOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'STREAK_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Harmony',
            description: "Some numbers just belong together.",
            icon: 'fa-circle-2',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Streak',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::StreakerOne.tasks(1), metadata: metadata,
        }
    }
}

pub impl StreakTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'STREAK_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Resonance',
            description: "Order from chaos, three in a row.",
            icon: 'fa-circle-3',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Streak',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::StreakerTwo.tasks(1), metadata: metadata,
        }
    }
}

pub impl StreakThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'STREAK_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Defiant Sequence',
            description: "Some patterns refuse to be tamed.",
            icon: 'fa-circle-4',
            points: 80,
            hidden: false,
            index: 2,
            group: 'Streak',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::StreakerThree.tasks(1), metadata: metadata,
        }
    }
}
