pub use quest::types::metadata::{QuestMetadata, QuestMetadataTrait};
pub use quest::types::reward::QuestReward;
pub use quest::types::task::Task as QuestTask;
use starknet::ContractAddress;
use crate::elements::quests;
pub use crate::elements::quests::interface::QuestTrait;
pub use crate::elements::tasks::index::{Task, TaskTrait};

// Constants

pub const QUEST_COUNT: u8 = 25;
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
            QuestType::WeeklyContenderOne => quests::contender::WeeklyContenderOne::props(registry),
            QuestType::WeeklyContenderTwo => quests::contender::WeeklyContenderTwo::props(registry),
            QuestType::WeeklyContenderThree => quests::contender::WeeklyContenderThree::props(
                registry,
            ),
            QuestType::WeeklyEarnerOne => quests::earner::WeeklyEarnerOne::props(registry),
            QuestType::WeeklyEarnerTwo => quests::earner::WeeklyEarnerTwo::props(registry),
            QuestType::WeeklyEarnerThree => quests::earner::WeeklyEarnerThree::props(registry),
            QuestType::WeeklyPlacerOne => quests::placer::WeeklyPlacerOne::props(registry),
            QuestType::WeeklyPlacerTwo => quests::placer::WeeklyPlacerTwo::props(registry),
            QuestType::WeeklyPlacerThree => quests::placer::WeeklyPlacerThree::props(registry),
            QuestType::WeeklyFinisher => quests::finisher::WeeklyFinisher::props(registry),
            _ => Default::default(),
        }
    }

    fn reward(self: QuestType) -> u64 {
        match self {
            QuestType::StarterOne => 200,
            QuestType::StarterTwo => 300,
            QuestType::StarterThree => 400,
            QuestType::StarterFour => 500,
            QuestType::StarterFive => 600,
            QuestType::DailyContenderOne => 200,
            QuestType::DailyContenderTwo => 400,
            QuestType::DailyContenderThree => 800,
            QuestType::DailyEarnerOne => 200,
            QuestType::DailyEarnerTwo => 400,
            QuestType::DailyEarnerThree => 800,
            QuestType::DailyPlacerOne => 200,
            QuestType::DailyPlacerTwo => 400,
            QuestType::DailyPlacerThree => 800,
            QuestType::DailyFinisher => 800,
            QuestType::WeeklyContenderOne => 1000,
            QuestType::WeeklyContenderTwo => 2000,
            QuestType::WeeklyContenderThree => 4000,
            QuestType::WeeklyEarnerOne => 1000,
            QuestType::WeeklyEarnerTwo => 2000,
            QuestType::WeeklyEarnerThree => 4000,
            QuestType::WeeklyPlacerOne => 1000,
            QuestType::WeeklyPlacerTwo => 2000,
            QuestType::WeeklyPlacerThree => 4000,
            QuestType::WeeklyFinisher => 4000,
            _ => 0,
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
            QuestType::WeeklyContenderOne => 16,
            QuestType::WeeklyContenderTwo => 17,
            QuestType::WeeklyContenderThree => 18,
            QuestType::WeeklyEarnerOne => 19,
            QuestType::WeeklyEarnerTwo => 20,
            QuestType::WeeklyEarnerThree => 21,
            QuestType::WeeklyPlacerOne => 22,
            QuestType::WeeklyPlacerTwo => 23,
            QuestType::WeeklyPlacerThree => 24,
            QuestType::WeeklyFinisher => 25,
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
            16 => QuestType::WeeklyContenderOne,
            17 => QuestType::WeeklyContenderTwo,
            18 => QuestType::WeeklyContenderThree,
            19 => QuestType::WeeklyEarnerOne,
            20 => QuestType::WeeklyEarnerTwo,
            21 => QuestType::WeeklyEarnerThree,
            22 => QuestType::WeeklyPlacerOne,
            23 => QuestType::WeeklyPlacerTwo,
            24 => QuestType::WeeklyPlacerThree,
            25 => QuestType::WeeklyFinisher,
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
                name: "",
                description: "",
                icon: "",
                registry: 0.try_into().unwrap(),
                rewards: array![].span(),
            ),
        }
    }
}
