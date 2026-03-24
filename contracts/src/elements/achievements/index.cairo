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
pub enum AchievementType {
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
    #[inline]
    fn identifier(self: AchievementType) -> felt252 {
        match self {
            AchievementType::None => 0,
            AchievementType::ClaimerOne => achievements::claimer::ClaimerOne::identifier(),
            AchievementType::ClaimerTwo => achievements::claimer::ClaimerTwo::identifier(),
            AchievementType::ClaimerThree => achievements::claimer::ClaimerThree::identifier(),
            AchievementType::GrinderOne => achievements::grinder::GrinderOne::identifier(),
            AchievementType::GrinderTwo => achievements::grinder::GrinderTwo::identifier(),
            AchievementType::GrinderThree => achievements::grinder::GrinderThree::identifier(),
            AchievementType::StreakOne => achievements::streak::StreakOne::identifier(),
            AchievementType::StreakTwo => achievements::streak::StreakTwo::identifier(),
            AchievementType::StreakThree => achievements::streak::StreakThree::identifier(),
            AchievementType::ChainerOne => achievements::chainer::ChainerOne::identifier(),
            AchievementType::ChainerTwo => achievements::chainer::ChainerTwo::identifier(),
            AchievementType::ChainerThree => achievements::chainer::ChainerThree::identifier(),
            AchievementType::FillerOne => achievements::filler::FillerOne::identifier(),
            AchievementType::FillerTwo => achievements::filler::FillerTwo::identifier(),
            AchievementType::FillerThree => achievements::filler::FillerThree::identifier(),
            AchievementType::PlacerOne => achievements::placer::PlacerOne::identifier(),
            AchievementType::PlacerTwo => achievements::placer::PlacerTwo::identifier(),
            AchievementType::PlacerThree => achievements::placer::PlacerThree::identifier(),
            AchievementType::PowerOne => achievements::power::PowerOne::identifier(),
            AchievementType::PowerTwo => achievements::power::PowerTwo::identifier(),
            AchievementType::PowerThree => achievements::power::PowerThree::identifier(),
            AchievementType::TrapperOne => achievements::trapper::TrapperOne::identifier(),
            AchievementType::TrapperTwo => achievements::trapper::TrapperTwo::identifier(),
            AchievementType::TrapperThree => achievements::trapper::TrapperThree::identifier(),
            AchievementType::ReferenceI => achievements::reference::ReferenceI::identifier(),
            AchievementType::ReferenceII => achievements::reference::ReferenceII::identifier(),
            AchievementType::ReferenceIII => achievements::reference::ReferenceIII::identifier(),
            AchievementType::ReferenceIV => achievements::reference::ReferenceIV::identifier(),
            AchievementType::ReferenceV => achievements::reference::ReferenceV::identifier(),
            AchievementType::ReferenceVI => achievements::reference::ReferenceVI::identifier(),
            AchievementType::ReferenceVII => achievements::reference::ReferenceVII::identifier(),
        }
    }

    #[inline]
    fn props(self: AchievementType) -> AchievementProps {
        match self {
            AchievementType::ClaimerOne => achievements::claimer::ClaimerOne::props(),
            AchievementType::ClaimerTwo => achievements::claimer::ClaimerTwo::props(),
            AchievementType::ClaimerThree => achievements::claimer::ClaimerThree::props(),
            AchievementType::GrinderOne => achievements::grinder::GrinderOne::props(),
            AchievementType::GrinderTwo => achievements::grinder::GrinderTwo::props(),
            AchievementType::GrinderThree => achievements::grinder::GrinderThree::props(),
            AchievementType::StreakOne => achievements::streak::StreakOne::props(),
            AchievementType::StreakTwo => achievements::streak::StreakTwo::props(),
            AchievementType::StreakThree => achievements::streak::StreakThree::props(),
            AchievementType::ChainerOne => achievements::chainer::ChainerOne::props(),
            AchievementType::ChainerTwo => achievements::chainer::ChainerTwo::props(),
            AchievementType::ChainerThree => achievements::chainer::ChainerThree::props(),
            AchievementType::FillerOne => achievements::filler::FillerOne::props(),
            AchievementType::FillerTwo => achievements::filler::FillerTwo::props(),
            AchievementType::FillerThree => achievements::filler::FillerThree::props(),
            AchievementType::PlacerOne => achievements::placer::PlacerOne::props(),
            AchievementType::PlacerTwo => achievements::placer::PlacerTwo::props(),
            AchievementType::PlacerThree => achievements::placer::PlacerThree::props(),
            AchievementType::PowerOne => achievements::power::PowerOne::props(),
            AchievementType::PowerTwo => achievements::power::PowerTwo::props(),
            AchievementType::PowerThree => achievements::power::PowerThree::props(),
            AchievementType::TrapperOne => achievements::trapper::TrapperOne::props(),
            AchievementType::TrapperTwo => achievements::trapper::TrapperTwo::props(),
            AchievementType::TrapperThree => achievements::trapper::TrapperThree::props(),
            AchievementType::ReferenceI => achievements::reference::ReferenceI::props(),
            AchievementType::ReferenceII => achievements::reference::ReferenceII::props(),
            AchievementType::ReferenceIII => achievements::reference::ReferenceIII::props(),
            AchievementType::ReferenceIV => achievements::reference::ReferenceIV::props(),
            AchievementType::ReferenceV => achievements::reference::ReferenceV::props(),
            AchievementType::ReferenceVI => achievements::reference::ReferenceVI::props(),
            AchievementType::ReferenceVII => achievements::reference::ReferenceVII::props(),
            _ => Default::default(),
        }
    }
}

impl IntoAchievementU8 of core::traits::Into<AchievementType, u8> {
    #[inline]
    fn into(self: AchievementType) -> u8 {
        match self {
            AchievementType::None => 0,
            AchievementType::ClaimerOne => 1,
            AchievementType::ClaimerTwo => 2,
            AchievementType::ClaimerThree => 3,
            AchievementType::GrinderOne => 4,
            AchievementType::GrinderTwo => 5,
            AchievementType::GrinderThree => 6,
            AchievementType::StreakOne => 7,
            AchievementType::StreakTwo => 8,
            AchievementType::StreakThree => 9,
            AchievementType::ChainerOne => 10,
            AchievementType::ChainerTwo => 11,
            AchievementType::ChainerThree => 12,
            AchievementType::FillerOne => 13,
            AchievementType::FillerTwo => 14,
            AchievementType::FillerThree => 15,
            AchievementType::PlacerOne => 16,
            AchievementType::PlacerTwo => 17,
            AchievementType::PlacerThree => 18,
            AchievementType::PowerOne => 19,
            AchievementType::PowerTwo => 20,
            AchievementType::PowerThree => 21,
            AchievementType::TrapperOne => 22,
            AchievementType::TrapperTwo => 23,
            AchievementType::TrapperThree => 24,
            AchievementType::ReferenceI => 25,
            AchievementType::ReferenceII => 26,
            AchievementType::ReferenceIII => 27,
            AchievementType::ReferenceIV => 28,
            AchievementType::ReferenceV => 29,
            AchievementType::ReferenceVI => 30,
            AchievementType::ReferenceVII => 31,
        }
    }
}

impl IntoU8Achievement of core::traits::Into<u8, AchievementType> {
    #[inline]
    fn into(self: u8) -> AchievementType {
        let card: felt252 = self.into();
        match card {
            0 => AchievementType::None,
            1 => AchievementType::ClaimerOne,
            2 => AchievementType::ClaimerTwo,
            3 => AchievementType::ClaimerThree,
            4 => AchievementType::GrinderOne,
            5 => AchievementType::GrinderTwo,
            6 => AchievementType::GrinderThree,
            7 => AchievementType::StreakOne,
            8 => AchievementType::StreakTwo,
            9 => AchievementType::StreakThree,
            10 => AchievementType::ChainerOne,
            11 => AchievementType::ChainerTwo,
            12 => AchievementType::ChainerThree,
            13 => AchievementType::FillerOne,
            14 => AchievementType::FillerTwo,
            15 => AchievementType::FillerThree,
            16 => AchievementType::PlacerOne,
            17 => AchievementType::PlacerTwo,
            18 => AchievementType::PlacerThree,
            19 => AchievementType::PowerOne,
            20 => AchievementType::PowerTwo,
            21 => AchievementType::PowerThree,
            22 => AchievementType::TrapperOne,
            23 => AchievementType::TrapperTwo,
            24 => AchievementType::TrapperThree,
            25 => AchievementType::ReferenceI,
            26 => AchievementType::ReferenceII,
            27 => AchievementType::ReferenceIII,
            28 => AchievementType::ReferenceIV,
            29 => AchievementType::ReferenceV,
            30 => AchievementType::ReferenceVI,
            31 => AchievementType::ReferenceVII,
            _ => AchievementType::None,
        }
    }
}

pub impl AchievementPropsDefault of core::traits::Default<AchievementProps> {
    #[inline]
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
