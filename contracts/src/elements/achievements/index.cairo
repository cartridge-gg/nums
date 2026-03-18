use achievement::types::metadata::{AchievementMetadata, MetadataTrait};
use achievement::types::task::Task as AchievementTask;
use crate::elements::achievements;
pub use crate::elements::achievements::interface::AchievementTrait;

// Constants

pub const ACHIEVEMENT_COUNT: u8 = 31;

// Types

#[derive(Drop)]
pub struct AchievementProps {
    pub id: felt252,
    pub tasks: Span<AchievementTask>,
    pub metadata: AchievementMetadata,
}

#[derive(Copy, Drop)]
pub enum Achievement {
    None,
    ClaimerOne,
    ClaimerTwo,
    ClaimerThree,
    GrinderOne,
    GrinderTwo,
    GrinderThree,
    StreakOne,
    StreakTwo,
    StreakThree,
    ChainerOne,
    ChainerTwo,
    ChainerThree,
    FillerOne,
    FillerTwo,
    FillerThree,
    PlacerOne,
    PlacerTwo,
    PlacerThree,
    PowerOne,
    PowerTwo,
    PowerThree,
    TrapperOne,
    TrapperTwo,
    TrapperThree,
    ReferenceI,
    ReferenceII,
    ReferenceIII,
    ReferenceIV,
    ReferenceV,
    ReferenceVI,
    ReferenceVII,
}

#[generate_trait]
pub impl AchievementImpl of IAchievement {
    fn identifier(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::ClaimerOne => achievements::claimer::ClaimerOne::identifier(),
            Achievement::ClaimerTwo => achievements::claimer::ClaimerTwo::identifier(),
            Achievement::ClaimerThree => achievements::claimer::ClaimerThree::identifier(),
            Achievement::GrinderOne => achievements::grinder::GrinderOne::identifier(),
            Achievement::GrinderTwo => achievements::grinder::GrinderTwo::identifier(),
            Achievement::GrinderThree => achievements::grinder::GrinderThree::identifier(),
            Achievement::StreakOne => achievements::streak::StreakOne::identifier(),
            Achievement::StreakTwo => achievements::streak::StreakTwo::identifier(),
            Achievement::StreakThree => achievements::streak::StreakThree::identifier(),
            Achievement::ChainerOne => achievements::chainer::ChainerOne::identifier(),
            Achievement::ChainerTwo => achievements::chainer::ChainerTwo::identifier(),
            Achievement::ChainerThree => achievements::chainer::ChainerThree::identifier(),
            Achievement::FillerOne => achievements::filler::FillerOne::identifier(),
            Achievement::FillerTwo => achievements::filler::FillerTwo::identifier(),
            Achievement::FillerThree => achievements::filler::FillerThree::identifier(),
            Achievement::PlacerOne => achievements::placer::PlacerOne::identifier(),
            Achievement::PlacerTwo => achievements::placer::PlacerTwo::identifier(),
            Achievement::PlacerThree => achievements::placer::PlacerThree::identifier(),
            Achievement::PowerOne => achievements::power::PowerOne::identifier(),
            Achievement::PowerTwo => achievements::power::PowerTwo::identifier(),
            Achievement::PowerThree => achievements::power::PowerThree::identifier(),
            Achievement::TrapperOne => achievements::trapper::TrapperOne::identifier(),
            Achievement::TrapperTwo => achievements::trapper::TrapperTwo::identifier(),
            Achievement::TrapperThree => achievements::trapper::TrapperThree::identifier(),
            Achievement::ReferenceI => achievements::reference::ReferenceI::identifier(),
            Achievement::ReferenceII => achievements::reference::ReferenceII::identifier(),
            Achievement::ReferenceIII => achievements::reference::ReferenceIII::identifier(),
            Achievement::ReferenceIV => achievements::reference::ReferenceIV::identifier(),
            Achievement::ReferenceV => achievements::reference::ReferenceV::identifier(),
            Achievement::ReferenceVI => achievements::reference::ReferenceVI::identifier(),
            Achievement::ReferenceVII => achievements::reference::ReferenceVII::identifier(),
        }
    }

    fn props(self: Achievement) -> AchievementProps {
        match self {
            Achievement::ClaimerOne => achievements::claimer::ClaimerOne::props(),
            Achievement::ClaimerTwo => achievements::claimer::ClaimerTwo::props(),
            Achievement::ClaimerThree => achievements::claimer::ClaimerThree::props(),
            Achievement::GrinderOne => achievements::grinder::GrinderOne::props(),
            Achievement::GrinderTwo => achievements::grinder::GrinderTwo::props(),
            Achievement::GrinderThree => achievements::grinder::GrinderThree::props(),
            Achievement::StreakOne => achievements::streak::StreakOne::props(),
            Achievement::StreakTwo => achievements::streak::StreakTwo::props(),
            Achievement::StreakThree => achievements::streak::StreakThree::props(),
            Achievement::ChainerOne => achievements::chainer::ChainerOne::props(),
            Achievement::ChainerTwo => achievements::chainer::ChainerTwo::props(),
            Achievement::ChainerThree => achievements::chainer::ChainerThree::props(),
            Achievement::FillerOne => achievements::filler::FillerOne::props(),
            Achievement::FillerTwo => achievements::filler::FillerTwo::props(),
            Achievement::FillerThree => achievements::filler::FillerThree::props(),
            Achievement::PlacerOne => achievements::placer::PlacerOne::props(),
            Achievement::PlacerTwo => achievements::placer::PlacerTwo::props(),
            Achievement::PlacerThree => achievements::placer::PlacerThree::props(),
            Achievement::PowerOne => achievements::power::PowerOne::props(),
            Achievement::PowerTwo => achievements::power::PowerTwo::props(),
            Achievement::PowerThree => achievements::power::PowerThree::props(),
            Achievement::TrapperOne => achievements::trapper::TrapperOne::props(),
            Achievement::TrapperTwo => achievements::trapper::TrapperTwo::props(),
            Achievement::TrapperThree => achievements::trapper::TrapperThree::props(),
            Achievement::ReferenceI => achievements::reference::ReferenceI::props(),
            Achievement::ReferenceII => achievements::reference::ReferenceII::props(),
            Achievement::ReferenceIII => achievements::reference::ReferenceIII::props(),
            Achievement::ReferenceIV => achievements::reference::ReferenceIV::props(),
            Achievement::ReferenceV => achievements::reference::ReferenceV::props(),
            Achievement::ReferenceVI => achievements::reference::ReferenceVI::props(),
            Achievement::ReferenceVII => achievements::reference::ReferenceVII::props(),
            _ => Default::default(),
        }
    }
}

impl IntoAchievementU8 of core::traits::Into<Achievement, u8> {
    fn into(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
            Achievement::ClaimerOne => 1,
            Achievement::ClaimerTwo => 2,
            Achievement::ClaimerThree => 3,
            Achievement::GrinderOne => 4,
            Achievement::GrinderTwo => 5,
            Achievement::GrinderThree => 6,
            Achievement::StreakOne => 7,
            Achievement::StreakTwo => 8,
            Achievement::StreakThree => 9,
            Achievement::ChainerOne => 10,
            Achievement::ChainerTwo => 11,
            Achievement::ChainerThree => 12,
            Achievement::FillerOne => 13,
            Achievement::FillerTwo => 14,
            Achievement::FillerThree => 15,
            Achievement::PlacerOne => 16,
            Achievement::PlacerTwo => 17,
            Achievement::PlacerThree => 18,
            Achievement::PowerOne => 19,
            Achievement::PowerTwo => 20,
            Achievement::PowerThree => 21,
            Achievement::TrapperOne => 22,
            Achievement::TrapperTwo => 23,
            Achievement::TrapperThree => 24,
            Achievement::ReferenceI => 25,
            Achievement::ReferenceII => 26,
            Achievement::ReferenceIII => 27,
            Achievement::ReferenceIV => 28,
            Achievement::ReferenceV => 29,
            Achievement::ReferenceVI => 30,
            Achievement::ReferenceVII => 31,
        }
    }
}

impl IntoU8Achievement of core::traits::Into<u8, Achievement> {
    fn into(self: u8) -> Achievement {
        let card: felt252 = self.into();
        match card {
            0 => Achievement::None,
            1 => Achievement::ClaimerOne,
            2 => Achievement::ClaimerTwo,
            3 => Achievement::ClaimerThree,
            4 => Achievement::GrinderOne,
            5 => Achievement::GrinderTwo,
            6 => Achievement::GrinderThree,
            7 => Achievement::StreakOne,
            8 => Achievement::StreakTwo,
            9 => Achievement::StreakThree,
            10 => Achievement::ChainerOne,
            11 => Achievement::ChainerTwo,
            12 => Achievement::ChainerThree,
            13 => Achievement::FillerOne,
            14 => Achievement::FillerTwo,
            15 => Achievement::FillerThree,
            16 => Achievement::PlacerOne,
            17 => Achievement::PlacerTwo,
            18 => Achievement::PlacerThree,
            19 => Achievement::PowerOne,
            20 => Achievement::PowerTwo,
            21 => Achievement::PowerThree,
            22 => Achievement::TrapperOne,
            23 => Achievement::TrapperTwo,
            24 => Achievement::TrapperThree,
            25 => Achievement::ReferenceI,
            26 => Achievement::ReferenceII,
            27 => Achievement::ReferenceIII,
            28 => Achievement::ReferenceIV,
            29 => Achievement::ReferenceV,
            30 => Achievement::ReferenceVI,
            31 => Achievement::ReferenceVII,
            _ => Achievement::None,
        }
    }
}

pub impl AchievementPropsDefault of core::traits::Default<AchievementProps> {
    fn default() -> AchievementProps {
        AchievementProps {
            id: 0,
            tasks: [].span(),
            metadata: MetadataTrait::new(
                title: '',
                description: "",
                icon: '',
                points: 0,
                hidden: false,
                index: 0,
                group: '',
                rewards: [].span(),
                data: "",
            ),
        }
    }
}
