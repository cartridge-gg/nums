use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl PowerOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'POWER_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Supplemental',
            description: "A little help goes a long way.",
            icon: 'fa-plug',
            points: 15,
            hidden: false,
            index: 0,
            group: 'Power',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Power.tasks(200), metadata: metadata,
        }
    }
}

pub impl PowerTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'POWER_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Enhanced',
            description: "Power is nothing without intention.",
            icon: 'fa-gauge-high',
            points: 30,
            hidden: false,
            index: 1,
            group: 'Power',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Power.tasks(1_000), metadata: metadata,
        }
    }
}

pub impl PowerThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'POWER_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Full Override',
            description: "When the usual tools are not enough.",
            icon: 'fa-atom',
            points: 55,
            hidden: false,
            index: 2,
            group: 'Power',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Power.tasks(2_000), metadata: metadata,
        }
    }
}
