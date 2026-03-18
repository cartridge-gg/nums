use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl PlacerOne of AchievementTrait {
    fn identifier() -> felt252 {
        'PLACER_ONE'
    }

    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Data Entry',
            description: "Every number deserves your full attention.",
            icon: 'fa-list-ol',
            points: 15,
            hidden: false,
            index: 0,
            group: 'Placer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(),
            tasks: Task::Filler.tasks(1_000),
            metadata: metadata,
        }
    }
}

pub impl PlacerTwo of AchievementTrait {
    fn identifier() -> felt252 {
        'PLACER_TWO'
    }

    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Refinement',
            description: "Every number matters, even the scary ones.",
            icon: 'fa-arrow-up-1-9',
            points: 30,
            hidden: false,
            index: 1,
            group: 'Placer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(),
            tasks: Task::Filler.tasks(5_000),
            metadata: metadata,
        }
    }
}

pub impl PlacerThree of AchievementTrait {
    fn identifier() -> felt252 {
        'PLACER_THREE'
    }

    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'The Whole Board',
            description: "Not a single number left unsorted.",
            icon: 'fa-clipboard-check',
            points: 55,
            hidden: false,
            index: 2,
            group: 'Placer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(),
            tasks: Task::Filler.tasks(10_000),
            metadata: metadata,
        }
    }
}
