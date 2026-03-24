use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl TrapperOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'TRAPPER_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Hazard Pay',
            description: "Some risks come with the territory.",
            icon: 'fa-skull',
            points: 15,
            hidden: false,
            index: 0,
            group: 'Trapper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Trigger.tasks(300), metadata: metadata,
        }
    }
}

pub impl TrapperTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'TRAPPER_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Wellness Check',
            description: "The experience was designed to help.",
            icon: 'fa-skull-crossbones',
            points: 30,
            hidden: false,
            index: 1,
            group: 'Trapper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Trigger.tasks(1_500), metadata: metadata,
        }
    }
}

pub impl TrapperThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'TRAPPER_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Calloused',
            description: "Some people are forged, not born.",
            icon: 'fa-radiation',
            points: 55,
            hidden: false,
            index: 2,
            group: 'Trapper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Trigger.tasks(3_000), metadata: metadata,
        }
    }
}
