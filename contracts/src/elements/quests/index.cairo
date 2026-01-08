pub use quest::types::metadata::{QuestMetadata, QuestMetadataTrait};
pub use quest::types::reward::QuestReward;
pub use quest::types::task::Task as QuestTask;
use starknet::ContractAddress;
use crate::elements::quests;
pub use crate::elements::quests::interface::QuestTrait;
pub use crate::elements::tasks::index::{Task, TaskTrait};

// Constants

pub const QUEST_COUNT: u8 = 15;
pub const ONE_DAY: u64 = 24 * 60 * 60;

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
            QuestType::None => 0,
        }
    }

    fn props(self: QuestType, registry: ContractAddress) -> QuestProps {
        match self {
            QuestType::StarterOne => quests::starter::StarterOne::props(registry),
            QuestType::StarterTwo => quests::starter::StarterTwo::props(registry),
            QuestType::StarterThree => quests::starter::StarterThree::props(registry),
            QuestType::StarterFour => quests::starter::StarterFour::props(registry),
            QuestType::StarterFive => quests::starter::StarterFive::props(registry),
            QuestType::DailyContenderOne => quests::contender::DailyContenderOne::props(registry),
            QuestType::DailyContenderTwo => quests::contender::DailyContenderTwo::props(registry),
            QuestType::DailyContenderThree => quests::contender::DailyContenderThree::props(
                registry,
            ),
            QuestType::DailyEarnerOne => quests::earner::DailyEarnerOne::props(registry),
            QuestType::DailyEarnerTwo => quests::earner::DailyEarnerTwo::props(registry),
            QuestType::DailyEarnerThree => quests::earner::DailyEarnerThree::props(registry),
            QuestType::DailyPlacerOne => quests::placer::DailyPlacerOne::props(registry),
            QuestType::DailyPlacerTwo => quests::placer::DailyPlacerTwo::props(registry),
            QuestType::DailyPlacerThree => quests::placer::DailyPlacerThree::props(registry),
            QuestType::DailyFinisher => quests::finisher::DailyFinisher::props(registry),
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
            QuestType::DailyContenderOne => (200, Task::None),
            QuestType::DailyContenderTwo => (400, Task::None),
            QuestType::DailyContenderThree => (800, Task::None),
            QuestType::DailyEarnerOne => (200, Task::None),
            QuestType::DailyEarnerTwo => (400, Task::None),
            QuestType::DailyEarnerThree => (800, Task::None),
            QuestType::DailyPlacerOne => (200, Task::None),
            QuestType::DailyPlacerTwo => (400, Task::None),
            QuestType::DailyPlacerThree => (800, Task::None),
            QuestType::DailyFinisher => (800, Task::Master),
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
            QuestType::DailyContenderOne => 6,
            QuestType::DailyContenderTwo => 7,
            QuestType::DailyContenderThree => 8,
            QuestType::DailyEarnerOne => 9,
            QuestType::DailyEarnerTwo => 10,
            QuestType::DailyEarnerThree => 11,
            QuestType::DailyPlacerOne => 12,
            QuestType::DailyPlacerTwo => 13,
            QuestType::DailyPlacerThree => 14,
            QuestType::DailyFinisher => 15,
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
            6 => QuestType::DailyContenderOne,
            7 => QuestType::DailyContenderTwo,
            8 => QuestType::DailyContenderThree,
            9 => QuestType::DailyEarnerOne,
            10 => QuestType::DailyEarnerTwo,
            11 => QuestType::DailyEarnerThree,
            12 => QuestType::DailyPlacerOne,
            13 => QuestType::DailyPlacerTwo,
            14 => QuestType::DailyPlacerThree,
            15 => QuestType::DailyFinisher,
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
                name: "",
                description: "",
                icon: "",
                registry: 0.try_into().unwrap(),
                rewards: array![].span(),
            ),
        }
    }
}
