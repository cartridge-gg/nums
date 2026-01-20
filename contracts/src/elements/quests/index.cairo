pub use quest::types::metadata::{QuestMetadata, QuestMetadataTrait};
pub use quest::types::reward::QuestReward;
pub use quest::types::task::Task as QuestTask;
use starknet::ContractAddress;
use crate::elements::quests;
pub use crate::elements::quests::interface::QuestTrait;
pub use crate::elements::tasks::index::{Task, TaskTrait};

// Constants

pub const QUEST_COUNT: u8 = 10;
pub const ONE_DAY: u64 = 24 * 60 * 60;

pub fn ICON() -> ByteArray {
    "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/90868d05-cb75-4c42-278c-5a540db2cf00/logo"
}

// Types

#[derive(Copy, Drop)]
pub enum QuestType {
    None,
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
            QuestType::DailyContenderOne => 1,
            QuestType::DailyContenderTwo => 2,
            QuestType::DailyContenderThree => 3,
            QuestType::DailyEarnerOne => 4,
            QuestType::DailyEarnerTwo => 5,
            QuestType::DailyEarnerThree => 6,
            QuestType::DailyPlacerOne => 7,
            QuestType::DailyPlacerTwo => 8,
            QuestType::DailyPlacerThree => 9,
            QuestType::DailyFinisher => 10,
        }
    }
}

impl IntoU8Quest of core::traits::Into<u8, QuestType> {
    fn into(self: u8) -> QuestType {
        match self {
            0 => QuestType::None,
            1 => QuestType::DailyContenderOne,
            2 => QuestType::DailyContenderTwo,
            3 => QuestType::DailyContenderThree,
            4 => QuestType::DailyEarnerOne,
            5 => QuestType::DailyEarnerTwo,
            6 => QuestType::DailyEarnerThree,
            7 => QuestType::DailyPlacerOne,
            8 => QuestType::DailyPlacerTwo,
            9 => QuestType::DailyPlacerThree,
            10 => QuestType::DailyFinisher,
            _ => QuestType::None,
        }
    }
}

impl IntoFelt252Quest of core::traits::Into<felt252, QuestType> {
    fn into(self: felt252) -> QuestType {
        if self == quests::contender::DailyContenderOne::identifier() {
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
