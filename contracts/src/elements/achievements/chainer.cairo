use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl ChainerOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CHAINER_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Chain Reaction',
            description: "Every action echoes.",
            icon: 'fa-link',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Chainer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ChainerOne.tasks(1), metadata: metadata,
        }
    }
}

pub impl ChainerTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CHAINER_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Tempered',
            description: "Pain is just information passing through.",
            icon: 'fa-link-slash',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Chainer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ChainerTwo.tasks(1), metadata: metadata,
        }
    }
}

pub impl ChainerThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CHAINER_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Overtime',
            description: "All protocols have been activated.",
            icon: 'fa-burst',
            points: 80,
            hidden: false,
            index: 2,
            group: 'Chainer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ChainerThree.tasks(1), metadata: metadata,
        }
    }
}
