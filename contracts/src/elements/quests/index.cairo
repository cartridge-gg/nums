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
pub const TWO_DAYS: u64 = 2 * ONE_DAY;
pub const THREE_DAYS: u64 = 3 * ONE_DAY;

// Types

#[derive(Copy, Drop)]
pub enum QuestType {
    None,
    DailyFinisher,
    DailyPlacerOne,
    DailyPlacerTwo,
    DailyPlacerThree,
    DailyPowerOne,
    DailyPowerTwo,
    DailyPowerThree,
    DailyTriggerOne,
    DailyTriggerTwo,
    DailyTriggerThree,
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
            QuestType::DailyFinisher => quests::finisher::DailyFinisher::identifier(),
            QuestType::DailyPlacerOne => quests::placer::DailyPlacerOne::identifier(),
            QuestType::DailyPlacerTwo => quests::placer::DailyPlacerTwo::identifier(),
            QuestType::DailyPlacerThree => quests::placer::DailyPlacerThree::identifier(),
            QuestType::DailyPowerOne => quests::power::DailyPowerOne::identifier(),
            QuestType::DailyPowerTwo => quests::power::DailyPowerTwo::identifier(),
            QuestType::DailyPowerThree => quests::power::DailyPowerThree::identifier(),
            QuestType::DailyTriggerOne => quests::trigger::DailyTriggerOne::identifier(),
            QuestType::DailyTriggerTwo => quests::trigger::DailyTriggerTwo::identifier(),
            QuestType::DailyTriggerThree => quests::trigger::DailyTriggerThree::identifier(),
            QuestType::None => 0,
        }
    }

    fn props(self: QuestType, registry: ContractAddress) -> QuestProps {
        match self {
            QuestType::DailyFinisher => quests::finisher::DailyFinisher::props(registry),
            QuestType::DailyPlacerOne => quests::placer::DailyPlacerOne::props(registry),
            QuestType::DailyPlacerTwo => quests::placer::DailyPlacerTwo::props(registry),
            QuestType::DailyPlacerThree => quests::placer::DailyPlacerThree::props(registry),
            QuestType::DailyPowerOne => quests::power::DailyPowerOne::props(registry),
            QuestType::DailyPowerTwo => quests::power::DailyPowerTwo::props(registry),
            QuestType::DailyPowerThree => quests::power::DailyPowerThree::props(registry),
            QuestType::DailyTriggerOne => quests::trigger::DailyTriggerOne::props(registry),
            QuestType::DailyTriggerTwo => quests::trigger::DailyTriggerTwo::props(registry),
            QuestType::DailyTriggerThree => quests::trigger::DailyTriggerThree::props(registry),
            _ => Default::default(),
        }
    }

    fn reward(self: QuestType) -> bool {
        match self {
            QuestType::DailyFinisher => true,
            _ => false,
        }
    }
}


impl IntoQuestU8 of core::traits::Into<QuestType, u8> {
    fn into(self: QuestType) -> u8 {
        match self {
            QuestType::None => 0,
            QuestType::DailyFinisher => 1,
            QuestType::DailyPlacerOne => 2,
            QuestType::DailyPlacerTwo => 3,
            QuestType::DailyPlacerThree => 4,
            QuestType::DailyPowerOne => 5,
            QuestType::DailyPowerTwo => 6,
            QuestType::DailyPowerThree => 7,
            QuestType::DailyTriggerOne => 8,
            QuestType::DailyTriggerTwo => 9,
            QuestType::DailyTriggerThree => 10,
        }
    }
}

impl IntoU8Quest of core::traits::Into<u8, QuestType> {
    fn into(self: u8) -> QuestType {
        match self {
            0 => QuestType::None,
            1 => QuestType::DailyFinisher,
            2 => QuestType::DailyPlacerOne,
            3 => QuestType::DailyPlacerTwo,
            4 => QuestType::DailyPlacerThree,
            5 => QuestType::DailyPowerOne,
            6 => QuestType::DailyPowerTwo,
            7 => QuestType::DailyPowerThree,
            8 => QuestType::DailyTriggerOne,
            9 => QuestType::DailyTriggerTwo,
            10 => QuestType::DailyTriggerThree,
            _ => QuestType::None,
        }
    }
}

impl IntoFelt252Quest of core::traits::Into<felt252, QuestType> {
    fn into(self: felt252) -> QuestType {
        if self == quests::finisher::DailyFinisher::identifier() {
            return QuestType::DailyFinisher;
        } else if self == quests::placer::DailyPlacerOne::identifier() {
            return QuestType::DailyPlacerOne;
        } else if self == quests::placer::DailyPlacerTwo::identifier() {
            return QuestType::DailyPlacerTwo;
        } else if self == quests::placer::DailyPlacerThree::identifier() {
            return QuestType::DailyPlacerThree;
        } else if self == quests::power::DailyPowerOne::identifier() {
            return QuestType::DailyPowerOne;
        } else if self == quests::power::DailyPowerTwo::identifier() {
            return QuestType::DailyPowerTwo;
        } else if self == quests::power::DailyPowerThree::identifier() {
            return QuestType::DailyPowerThree;
        } else if self == quests::trigger::DailyTriggerOne::identifier() {
            return QuestType::DailyTriggerOne;
        } else if self == quests::trigger::DailyTriggerTwo::identifier() {
            return QuestType::DailyTriggerTwo;
        } else if self == quests::trigger::DailyTriggerThree::identifier() {
            return QuestType::DailyTriggerThree;
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
