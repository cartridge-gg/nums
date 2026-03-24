use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl ReferenceI of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_I'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Blackjack Master',
            description: "Hit or stand, you know how to play the odds.",
            icon: 'fa-cards',
            points: 10,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceOne.tasks(1), metadata: metadata,
        }
    }
}

pub impl ReferenceII of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_II'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'The Answer',
            description: "Life, the Universe, and Everything. You figured it out.",
            icon: 'fa-comment',
            points: 15,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceTwo.tasks(1), metadata: metadata,
        }
    }
}

pub impl ReferenceIII of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_III'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Achievement not found',
            description: "Oops... Looks like you took a wrong turn.",
            icon: 'fa-circle-question',
            points: 10,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceThree.tasks(1), metadata: metadata,
        }
    }
}

pub impl ReferenceIV of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_IV'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Jackpot!',
            description: "Luck is on your side. Keep spinning!",
            icon: 'fa-slot-machine',
            points: 15,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceFour.tasks(1), metadata: metadata,
        }
    }
}

pub impl ReferenceV of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_V'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Emergency Mode',
            description: "This is not a drill! Time to act fast.",
            icon: 'fa-siren-on',
            points: 10,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceFive.tasks(1), metadata: metadata,
        }
    }
}

pub impl ReferenceVI of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_VI'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Meme Lord',
            description: "420 blaze it!",
            icon: 'fa-joint',
            points: 10,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceSix.tasks(1), metadata: metadata,
        }
    }
}

pub impl ReferenceVII of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_VII'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Nice',
            description: "Oh yeaaah",
            icon: 'fa-face-smirking',
            points: 10,
            hidden: true,
            index: 0,
            group: 'Numbers',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ReferenceSeven.tasks(1), metadata: metadata,
        }
    }
}
