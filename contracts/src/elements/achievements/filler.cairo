use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl FillerOne of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_ONE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Almost There',
            description: "So close to a clean file.",
            icon: 'fa-battery-half',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Filler',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::FillerSixteen.tasks(1), metadata: metadata,
        }
    }
}

pub impl FillerTwo of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_TWO'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Final Bins',
            description: "Each number finds its rightful place.",
            icon: 'fa-battery-three-quarters',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Filler',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::FillerSeventeen.tasks(1), metadata: metadata,
        }
    }
}

pub impl FillerThree of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_THREE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Pristine',
            description: "The data has been fully refined.",
            icon: 'fa-battery-full',
            points: 80,
            hidden: false,
            index: 2,
            group: 'Filler',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::FillerEighteen.tasks(1), metadata: metadata,
        }
    }
}
