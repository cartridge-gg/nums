pub use quest::types::metadata::{QuestMetadata, QuestMetadataTrait};
pub use quest::types::reward::QuestReward;
pub use quest::types::task::Task as QuestTask;
use crate::elements::quests;
pub use crate::elements::quests::interface::QuestTrait;
pub use crate::elements::tasks::index::{Task, TaskTrait};

// Constants

pub const QUEST_COUNT: u8 = 28;
pub const ONE_DAY: u64 = 24 * 60 * 60;
pub const ONE_WEEK: u64 = 7 * 24 * 60 * 60;

pub fn ICON() -> ByteArray {
    "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/90868d05-cb75-4c42-278c-5a540db2cf00/logo"
}

// Types

#[derive(Copy, Drop)]
pub enum QuestType {
    None,
    // Permanent quests
    StarterOne,
    StarterTwo,
    StarterThree,
    StarterFour,
    StarterFive,
    LeaderOne,
    LeaderTwo,
    LeaderThree,
    // Daily quests
    DailyContenderOne,
    DailyContenderTwo,
    DailyContenderThree,
    DailyEarnerOne,
    DailyEarnerTwo,
    DailyEarnerThree,
    DailyPlacerOne,
    DailyPlacerTwo,
    DailyPlacerThree,
    DailyFinisher,
    // Weekly quests
    WeeklyContenderOne,
    WeeklyContenderTwo,
    WeeklyContenderThree,
    WeeklyEarnerOne,
    WeeklyEarnerTwo,
    WeeklyEarnerThree,
    WeeklyPlacerOne,
    WeeklyPlacerTwo,
    WeeklyPlacerThree,
    WeeklyFinisher,
}

#[derive(Clone, Drop, Serde)]
pub struct QuestProps {
    pub id: felt252,
    pub start: u64,
    pub end: u64,
    pub duration: u64,
    pub interval: u64,
    pub tasks: Array<QuestTask>,
    pub conditions: Array<felt252>,
    pub metadata: QuestMetadata,
}

#[generate_trait]
pub impl QuestImpl of IQuest {
    fn identifier(self: QuestType) -> felt252 {
        match self {
            QuestType::StarterOne => quests::starter::StarterOne::identifier(),
            QuestType::StarterTwo => quests::starter::StarterTwo::identifier(),
            QuestType::StarterThree => quests::starter::StarterThree::identifier(),
            QuestType::StarterFour => quests::starter::StarterFour::identifier(),
            QuestType::StarterFive => quests::starter::StarterFive::identifier(),
            QuestType::LeaderOne => quests::leader::LeaderOne::identifier(),
            QuestType::LeaderTwo => quests::leader::LeaderTwo::identifier(),
            QuestType::LeaderThree => quests::leader::LeaderThree::identifier(),
            QuestType::DailyContenderOne => quests::contender::DailyContenderOne::identifier(),
            QuestType::DailyContenderTwo => quests::contender::DailyContenderTwo::identifier(),
            QuestType::DailyContenderThree => quests::contender::DailyContenderThree::identifier(),
            QuestType::DailyEarnerOne => quests::earner::DailyEarnerOne::identifier(),
            QuestType::DailyEarnerTwo => quests::earner::DailyEarnerTwo::identifier(),
            QuestType::DailyEarnerThree => quests::earner::DailyEarnerThree::identifier(),
            QuestType::DailyPlacerOne => quests::placer::DailyPlacerOne::identifier(),
            QuestType::DailyPlacerTwo => quests::placer::DailyPlacerTwo::identifier(),
            QuestType::DailyPlacerThree => quests::placer::DailyPlacerThree::identifier(),
            QuestType::DailyFinisher => quests::finisher::DailyFinisher::identifier(),
            QuestType::WeeklyContenderOne => quests::contender::WeeklyContenderOne::identifier(),
            QuestType::WeeklyContenderTwo => quests::contender::WeeklyContenderTwo::identifier(),
            QuestType::WeeklyContenderThree => quests::contender::WeeklyContenderThree::identifier(),
            QuestType::WeeklyEarnerOne => quests::earner::WeeklyEarnerOne::identifier(),
            QuestType::WeeklyEarnerTwo => quests::earner::WeeklyEarnerTwo::identifier(),
            QuestType::WeeklyEarnerThree => quests::earner::WeeklyEarnerThree::identifier(),
            QuestType::WeeklyPlacerOne => quests::placer::WeeklyPlacerOne::identifier(),
            QuestType::WeeklyPlacerTwo => quests::placer::WeeklyPlacerTwo::identifier(),
            QuestType::WeeklyPlacerThree => quests::placer::WeeklyPlacerThree::identifier(),
            QuestType::WeeklyFinisher => quests::finisher::WeeklyFinisher::identifier(),
            QuestType::None => 0,
        }
    }

    fn props(self: QuestType) -> QuestProps {
        match self {
            QuestType::StarterOne => quests::starter::StarterOne::props(),
            QuestType::StarterTwo => quests::starter::StarterTwo::props(),
            QuestType::StarterThree => quests::starter::StarterThree::props(),
            QuestType::StarterFour => quests::starter::StarterFour::props(),
            QuestType::StarterFive => quests::starter::StarterFive::props(),
            QuestType::LeaderOne => quests::leader::LeaderOne::props(),
            QuestType::LeaderTwo => quests::leader::LeaderTwo::props(),
            QuestType::LeaderThree => quests::leader::LeaderThree::props(),
            QuestType::DailyContenderOne => quests::contender::DailyContenderOne::props(),
            QuestType::DailyContenderTwo => quests::contender::DailyContenderTwo::props(),
            QuestType::DailyContenderThree => quests::contender::DailyContenderThree::props(),
            QuestType::DailyEarnerOne => quests::earner::DailyEarnerOne::props(),
            QuestType::DailyEarnerTwo => quests::earner::DailyEarnerTwo::props(),
            QuestType::DailyEarnerThree => quests::earner::DailyEarnerThree::props(),
            QuestType::DailyPlacerOne => quests::placer::DailyPlacerOne::props(),
            QuestType::DailyPlacerTwo => quests::placer::DailyPlacerTwo::props(),
            QuestType::DailyPlacerThree => quests::placer::DailyPlacerThree::props(),
            QuestType::DailyFinisher => quests::finisher::DailyFinisher::props(),
            QuestType::WeeklyContenderOne => quests::contender::WeeklyContenderOne::props(),
            QuestType::WeeklyContenderTwo => quests::contender::WeeklyContenderTwo::props(),
            QuestType::WeeklyContenderThree => quests::contender::WeeklyContenderThree::props(),
            QuestType::WeeklyEarnerOne => quests::earner::WeeklyEarnerOne::props(),
            QuestType::WeeklyEarnerTwo => quests::earner::WeeklyEarnerTwo::props(),
            QuestType::WeeklyEarnerThree => quests::earner::WeeklyEarnerThree::props(),
            QuestType::WeeklyPlacerOne => quests::placer::WeeklyPlacerOne::props(),
            QuestType::WeeklyPlacerTwo => quests::placer::WeeklyPlacerTwo::props(),
            QuestType::WeeklyPlacerThree => quests::placer::WeeklyPlacerThree::props(),
            QuestType::WeeklyFinisher => quests::finisher::WeeklyFinisher::props(),
            _ => Default::default(),
        }
    }

    fn reward(self: QuestType) -> (u64, Task) {
        match self {
            QuestType::StarterOne => (200, Task::None),
            QuestType::StarterTwo => (300, Task::None),
            QuestType::StarterThree => (400, Task::None),
            QuestType::StarterFour => (500, Task::None),
            QuestType::StarterFive => (600, Task::None),
            QuestType::LeaderOne => (0, Task::KingOne),
            QuestType::LeaderTwo => (0, Task::KingTwo),
            QuestType::LeaderThree => (0, Task::KingThree),
            QuestType::DailyContenderOne => (200, Task::None),
            QuestType::DailyContenderTwo => (400, Task::None),
            QuestType::DailyContenderThree => (800, Task::None),
            QuestType::DailyEarnerOne => (200, Task::None),
            QuestType::DailyEarnerTwo => (400, Task::None),
            QuestType::DailyEarnerThree => (800, Task::None),
            QuestType::DailyPlacerOne => (200, Task::None),
            QuestType::DailyPlacerTwo => (400, Task::None),
            QuestType::DailyPlacerThree => (800, Task::None),
            QuestType::DailyFinisher => (800, Task::None),
            QuestType::WeeklyContenderOne => (1000, Task::None),
            QuestType::WeeklyContenderTwo => (2000, Task::None),
            QuestType::WeeklyContenderThree => (4000, Task::None),
            QuestType::WeeklyEarnerOne => (1000, Task::None),
            QuestType::WeeklyEarnerTwo => (2000, Task::None),
            QuestType::WeeklyEarnerThree => (4000, Task::None),
            QuestType::WeeklyPlacerOne => (1000, Task::None),
            QuestType::WeeklyPlacerTwo => (2000, Task::None),
            QuestType::WeeklyPlacerThree => (4000, Task::None),
            QuestType::WeeklyFinisher => (4000, Task::None),
            _ => (0, Task::None),
        }
    }
}


impl IntoQuestU8 of core::traits::Into<QuestType, u8> {
    fn into(self: QuestType) -> u8 {
        match self {
            QuestType::None => 0,
            QuestType::StarterOne => 1,
            QuestType::StarterTwo => 2,
            QuestType::StarterThree => 3,
            QuestType::StarterFour => 4,
            QuestType::StarterFive => 5,
            QuestType::LeaderOne => 6,
            QuestType::LeaderTwo => 7,
            QuestType::LeaderThree => 8,
            QuestType::DailyContenderOne => 9,
            QuestType::DailyContenderTwo => 10,
            QuestType::DailyContenderThree => 11,
            QuestType::DailyEarnerOne => 12,
            QuestType::DailyEarnerTwo => 13,
            QuestType::DailyEarnerThree => 14,
            QuestType::DailyPlacerOne => 15,
            QuestType::DailyPlacerTwo => 16,
            QuestType::DailyPlacerThree => 17,
            QuestType::DailyFinisher => 18,
            QuestType::WeeklyContenderOne => 19,
            QuestType::WeeklyContenderTwo => 20,
            QuestType::WeeklyContenderThree => 21,
            QuestType::WeeklyEarnerOne => 22,
            QuestType::WeeklyEarnerTwo => 23,
            QuestType::WeeklyEarnerThree => 24,
            QuestType::WeeklyPlacerOne => 25,
            QuestType::WeeklyPlacerTwo => 26,
            QuestType::WeeklyPlacerThree => 27,
            QuestType::WeeklyFinisher => 28,
        }
    }
}

impl IntoU8Quest of core::traits::Into<u8, QuestType> {
    fn into(self: u8) -> QuestType {
        match self {
            0 => QuestType::None,
            1 => QuestType::StarterOne,
            2 => QuestType::StarterTwo,
            3 => QuestType::StarterThree,
            4 => QuestType::StarterFour,
            5 => QuestType::StarterFive,
            6 => QuestType::LeaderOne,
            7 => QuestType::LeaderTwo,
            8 => QuestType::LeaderThree,
            9 => QuestType::DailyContenderOne,
            10 => QuestType::DailyContenderTwo,
            11 => QuestType::DailyContenderThree,
            12 => QuestType::DailyEarnerOne,
            13 => QuestType::DailyEarnerTwo,
            14 => QuestType::DailyEarnerThree,
            15 => QuestType::DailyPlacerOne,
            16 => QuestType::DailyPlacerTwo,
            17 => QuestType::DailyPlacerThree,
            18 => QuestType::DailyFinisher,
            19 => QuestType::WeeklyContenderOne,
            20 => QuestType::WeeklyContenderTwo,
            21 => QuestType::WeeklyContenderThree,
            22 => QuestType::WeeklyEarnerOne,
            23 => QuestType::WeeklyEarnerTwo,
            24 => QuestType::WeeklyEarnerThree,
            25 => QuestType::WeeklyPlacerOne,
            26 => QuestType::WeeklyPlacerTwo,
            27 => QuestType::WeeklyPlacerThree,
            28 => QuestType::WeeklyFinisher,
            _ => QuestType::None,
        }
    }
}

impl IntoFelt252Quest of core::traits::Into<felt252, QuestType> {
    fn into(self: felt252) -> QuestType {
        if self == quests::starter::StarterOne::identifier() {
            return QuestType::StarterOne;
        } else if self == quests::starter::StarterTwo::identifier() {
            return QuestType::StarterTwo;
        } else if self == quests::starter::StarterThree::identifier() {
            return QuestType::StarterThree;
        } else if self == quests::starter::StarterFour::identifier() {
            return QuestType::StarterFour;
        } else if self == quests::starter::StarterFive::identifier() {
            return QuestType::StarterFive;
        } else if self == quests::leader::LeaderOne::identifier() {
            return QuestType::LeaderOne;
        } else if self == quests::leader::LeaderTwo::identifier() {
            return QuestType::LeaderTwo;
        } else if self == quests::leader::LeaderThree::identifier() {
            return QuestType::LeaderThree;
        } else if self == quests::contender::DailyContenderOne::identifier() {
            return QuestType::DailyContenderOne;
        } else if self == quests::contender::DailyContenderTwo::identifier() {
            return QuestType::DailyContenderTwo;
        } else if self == quests::contender::DailyContenderThree::identifier() {
            return QuestType::DailyContenderThree;
        } else if self == quests::earner::DailyEarnerOne::identifier() {
            return QuestType::DailyEarnerOne;
        } else if self == quests::earner::DailyEarnerTwo::identifier() {
            return QuestType::DailyEarnerTwo;
        } else if self == quests::earner::DailyEarnerThree::identifier() {
            return QuestType::DailyEarnerThree;
        } else if self == quests::placer::DailyPlacerOne::identifier() {
            return QuestType::DailyPlacerOne;
        } else if self == quests::placer::DailyPlacerTwo::identifier() {
            return QuestType::DailyPlacerTwo;
        } else if self == quests::placer::DailyPlacerThree::identifier() {
            return QuestType::DailyPlacerThree;
        } else if self == quests::finisher::DailyFinisher::identifier() {
            return QuestType::DailyFinisher;
        } else if self == quests::contender::WeeklyContenderOne::identifier() {
            return QuestType::WeeklyContenderOne;
        } else if self == quests::contender::WeeklyContenderTwo::identifier() {
            return QuestType::WeeklyContenderTwo;
        } else if self == quests::contender::WeeklyContenderThree::identifier() {
            return QuestType::WeeklyContenderThree;
        } else if self == quests::earner::WeeklyEarnerOne::identifier() {
            return QuestType::WeeklyEarnerOne;
        } else if self == quests::earner::WeeklyEarnerTwo::identifier() {
            return QuestType::WeeklyEarnerTwo;
        } else if self == quests::earner::WeeklyEarnerThree::identifier() {
            return QuestType::WeeklyEarnerThree;
        } else if self == quests::placer::WeeklyPlacerOne::identifier() {
            return QuestType::WeeklyPlacerOne;
        } else if self == quests::placer::WeeklyPlacerTwo::identifier() {
            return QuestType::WeeklyPlacerTwo;
        } else if self == quests::placer::WeeklyPlacerThree::identifier() {
            return QuestType::WeeklyPlacerThree;
        } else if self == quests::finisher::WeeklyFinisher::identifier() {
            return QuestType::WeeklyFinisher;
        } else {
            return QuestType::None;
        }
    }
}

pub impl QuestPropsDefault of core::traits::Default<QuestProps> {
    fn default() -> QuestProps {
        QuestProps {
            id: 0,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: array![],
            conditions: array![],
            metadata: QuestMetadataTrait::new(
                name: "", description: "", icon: "", rewards: array![].span(),
            ),
        }
    }
}
