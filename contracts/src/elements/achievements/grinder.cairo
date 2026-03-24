use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl GrinderOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'GRINDER_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'New Hire',
            description: "The work is mysterious and important.",
            icon: 'fa-seedling',
            points: 15,
            hidden: false,
            index: 0,
            group: 'Grinder',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Grinder.tasks(100), metadata: metadata,
        }
    }
}

pub impl GrinderTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'GRINDER_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Department Chief',
            description: "You have become what you repeatedly do.",
            icon: 'fa-fire',
            points: 30,
            hidden: false,
            index: 1,
            group: 'Grinder',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Grinder.tasks(500), metadata: metadata,
        }
    }
}

pub impl GrinderThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'GRINDER_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Perpetual',
            description: "The remembered do not decay.",
            icon: 'fa-dragon',
            points: 55,
            hidden: false,
            index: 2,
            group: 'Grinder',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Grinder.tasks(1_000), metadata: metadata,
        }
    }
}
