use achievement::types::task::{Task as ArcadeTask};
use nums_appchain::elements::achievements;

// Constants

pub const ACHIEVEMENT_COUNT: u8 = 23;

// Typ

#[derive(Copy, Drop)]
pub enum Achievement {
    None,
    KingI,
    KingII,
    KingIII,
    KingIV,
    KingV,
    GrinderI,
    GrinderII,
    GrinderIII,
    GrinderIV,
    GrinderV,
    ReferenceI,
    ReferenceII,
    ReferenceIII,
    ReferenceIV,
    ReferenceV,
    FillerOne,
    FillerTwo,
    FillerThree,
    FillerFour,
    FillerFive,
    StreakOne,
    StreakTwo,
    StreakThree,
}

#[generate_trait]
pub impl AchievementImpl of AchievementTrait {
    #[inline]
    fn identifier(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => achievements::king::King::identifier(0),
            Achievement::KingII => achievements::king::King::identifier(1),
            Achievement::KingIII => achievements::king::King::identifier(2),
            Achievement::KingIV => achievements::king::King::identifier(3),
            Achievement::KingV => achievements::king::King::identifier(4),
            Achievement::GrinderI => achievements::grinder::Grinder::identifier(0),
            Achievement::GrinderII => achievements::grinder::Grinder::identifier(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::identifier(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::identifier(3),
            Achievement::GrinderV => achievements::grinder::Grinder::identifier(4),
            Achievement::ReferenceI => achievements::reference::Reference::identifier(0),
            Achievement::ReferenceII => achievements::reference::Reference::identifier(1),
            Achievement::ReferenceIII => achievements::reference::Reference::identifier(2),
            Achievement::ReferenceIV => achievements::reference::Reference::identifier(3),
            Achievement::ReferenceV => achievements::reference::Reference::identifier(4),
            Achievement::FillerOne => achievements::filler::Filler::identifier(0),
            Achievement::FillerTwo => achievements::filler::Filler::identifier(1),
            Achievement::FillerThree => achievements::filler::Filler::identifier(2),
            Achievement::FillerFour => achievements::filler::Filler::identifier(3),
            Achievement::FillerFive => achievements::filler::Filler::identifier(4),
            Achievement::StreakOne => achievements::streak::Streak::identifier(0),
            Achievement::StreakTwo => achievements::streak::Streak::identifier(1),
            Achievement::StreakThree => achievements::streak::Streak::identifier(2),
        }
    }

    #[inline]
    fn hidden(self: Achievement) -> bool {
        match self {
            Achievement::None => true,
            Achievement::KingI => achievements::king::King::hidden(0),
            Achievement::KingII => achievements::king::King::hidden(1),
            Achievement::KingIII => achievements::king::King::hidden(2),
            Achievement::KingIV => achievements::king::King::hidden(3),
            Achievement::KingV => achievements::king::King::hidden(4),
            Achievement::GrinderI => achievements::grinder::Grinder::hidden(0),
            Achievement::GrinderII => achievements::grinder::Grinder::hidden(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::hidden(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::hidden(3),
            Achievement::GrinderV => achievements::grinder::Grinder::hidden(4),
            Achievement::ReferenceI => achievements::reference::Reference::hidden(0),
            Achievement::ReferenceII => achievements::reference::Reference::hidden(1),
            Achievement::ReferenceIII => achievements::reference::Reference::hidden(2),
            Achievement::ReferenceIV => achievements::reference::Reference::hidden(3),
            Achievement::ReferenceV => achievements::reference::Reference::hidden(4),
            Achievement::FillerOne => achievements::filler::Filler::hidden(0),
            Achievement::FillerTwo => achievements::filler::Filler::hidden(1),
            Achievement::FillerThree => achievements::filler::Filler::hidden(2),
            Achievement::FillerFour => achievements::filler::Filler::hidden(3),
            Achievement::FillerFive => achievements::filler::Filler::hidden(4),
            Achievement::StreakOne => achievements::streak::Streak::hidden(0),
            Achievement::StreakTwo => achievements::streak::Streak::hidden(1),
            Achievement::StreakThree => achievements::streak::Streak::hidden(2),
        }
    }

    #[inline]
    fn index(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => achievements::king::King::index(0),
            Achievement::KingII => achievements::king::King::index(1),
            Achievement::KingIII => achievements::king::King::index(2),
            Achievement::KingIV => achievements::king::King::index(3),
            Achievement::KingV => achievements::king::King::index(4),
            Achievement::GrinderI => achievements::grinder::Grinder::index(0),
            Achievement::GrinderII => achievements::grinder::Grinder::index(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::index(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::index(3),
            Achievement::GrinderV => achievements::grinder::Grinder::index(4),
            Achievement::ReferenceI => achievements::reference::Reference::index(0),
            Achievement::ReferenceII => achievements::reference::Reference::index(1),
            Achievement::ReferenceIII => achievements::reference::Reference::index(2),
            Achievement::ReferenceIV => achievements::reference::Reference::index(3),
            Achievement::ReferenceV => achievements::reference::Reference::index(4),
            Achievement::FillerOne => achievements::filler::Filler::index(0),
            Achievement::FillerTwo => achievements::filler::Filler::index(1),
            Achievement::FillerThree => achievements::filler::Filler::index(2),
            Achievement::FillerFour => achievements::filler::Filler::index(3),
            Achievement::FillerFive => achievements::filler::Filler::index(4),
            Achievement::StreakOne => achievements::streak::Streak::index(0),
            Achievement::StreakTwo => achievements::streak::Streak::index(1),
            Achievement::StreakThree => achievements::streak::Streak::index(2),
        }
    }

    #[inline]
    fn points(self: Achievement) -> u16 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => achievements::king::King::points(0),
            Achievement::KingII => achievements::king::King::points(1),
            Achievement::KingIII => achievements::king::King::points(2),
            Achievement::KingIV => achievements::king::King::points(3),
            Achievement::KingV => achievements::king::King::points(4),
            Achievement::GrinderI => achievements::grinder::Grinder::points(0),
            Achievement::GrinderII => achievements::grinder::Grinder::points(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::points(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::points(3),
            Achievement::GrinderV => achievements::grinder::Grinder::points(4),
            Achievement::ReferenceI => achievements::reference::Reference::points(0),
            Achievement::ReferenceII => achievements::reference::Reference::points(1),
            Achievement::ReferenceIII => achievements::reference::Reference::points(2),
            Achievement::ReferenceIV => achievements::reference::Reference::points(3),
            Achievement::ReferenceV => achievements::reference::Reference::points(4),
            Achievement::FillerOne => achievements::filler::Filler::points(0),
            Achievement::FillerTwo => achievements::filler::Filler::points(1),
            Achievement::FillerThree => achievements::filler::Filler::points(2),
            Achievement::FillerFour => achievements::filler::Filler::points(3),
            Achievement::FillerFive => achievements::filler::Filler::points(4),
            Achievement::StreakOne => achievements::streak::Streak::points(0),
            Achievement::StreakTwo => achievements::streak::Streak::points(1),
            Achievement::StreakThree => achievements::streak::Streak::points(2),
        }
    }

    #[inline]
    fn group(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => achievements::king::King::group(),
            Achievement::KingII => achievements::king::King::group(),
            Achievement::KingIII => achievements::king::King::group(),
            Achievement::KingIV => achievements::king::King::group(),
            Achievement::KingV => achievements::king::King::group(),
            Achievement::GrinderI => achievements::grinder::Grinder::group(),
            Achievement::GrinderII => achievements::grinder::Grinder::group(),
            Achievement::GrinderIII => achievements::grinder::Grinder::group(),
            Achievement::GrinderIV => achievements::grinder::Grinder::group(),
            Achievement::GrinderV => achievements::grinder::Grinder::group(),
            Achievement::ReferenceI => achievements::reference::Reference::group(),
            Achievement::ReferenceII => achievements::reference::Reference::group(),
            Achievement::ReferenceIII => achievements::reference::Reference::group(),
            Achievement::ReferenceIV => achievements::reference::Reference::group(),
            Achievement::ReferenceV => achievements::reference::Reference::group(),
            Achievement::FillerOne => achievements::filler::Filler::group(),
            Achievement::FillerTwo => achievements::filler::Filler::group(),
            Achievement::FillerThree => achievements::filler::Filler::group(),
            Achievement::FillerFour => achievements::filler::Filler::group(),
            Achievement::FillerFive => achievements::filler::Filler::group(),
            Achievement::StreakOne => achievements::streak::Streak::group(),
            Achievement::StreakTwo => achievements::streak::Streak::group(),
            Achievement::StreakThree => achievements::streak::Streak::group(),
        }
    }

    #[inline]
    fn icon(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => achievements::king::King::icon(0),
            Achievement::KingII => achievements::king::King::icon(1),
            Achievement::KingIII => achievements::king::King::icon(2),
            Achievement::KingIV => achievements::king::King::icon(3),
            Achievement::KingV => achievements::king::King::icon(4),
            Achievement::GrinderI => achievements::grinder::Grinder::icon(0),
            Achievement::GrinderII => achievements::grinder::Grinder::icon(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::icon(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::icon(3),
            Achievement::GrinderV => achievements::grinder::Grinder::icon(4),
            Achievement::ReferenceI => achievements::reference::Reference::icon(0),
            Achievement::ReferenceII => achievements::reference::Reference::icon(1),
            Achievement::ReferenceIII => achievements::reference::Reference::icon(2),
            Achievement::ReferenceIV => achievements::reference::Reference::icon(3),
            Achievement::ReferenceV => achievements::reference::Reference::icon(4),
            Achievement::FillerOne => achievements::filler::Filler::icon(0),
            Achievement::FillerTwo => achievements::filler::Filler::icon(1),
            Achievement::FillerThree => achievements::filler::Filler::icon(2),
            Achievement::FillerFour => achievements::filler::Filler::icon(3),
            Achievement::FillerFive => achievements::filler::Filler::icon(4),
            Achievement::StreakOne => achievements::streak::Streak::icon(0),
            Achievement::StreakTwo => achievements::streak::Streak::icon(1),
            Achievement::StreakThree => achievements::streak::Streak::icon(2),
        }
    }

    #[inline]
    fn title(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => achievements::king::King::title(0),
            Achievement::KingII => achievements::king::King::title(1),
            Achievement::KingIII => achievements::king::King::title(2),
            Achievement::KingIV => achievements::king::King::title(3),
            Achievement::KingV => achievements::king::King::title(4),
            Achievement::GrinderI => achievements::grinder::Grinder::title(0),
            Achievement::GrinderII => achievements::grinder::Grinder::title(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::title(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::title(3),
            Achievement::GrinderV => achievements::grinder::Grinder::title(4),
            Achievement::ReferenceI => achievements::reference::Reference::title(0),
            Achievement::ReferenceII => achievements::reference::Reference::title(1),
            Achievement::ReferenceIII => achievements::reference::Reference::title(2),
            Achievement::ReferenceIV => achievements::reference::Reference::title(3),
            Achievement::ReferenceV => achievements::reference::Reference::title(4),
            Achievement::FillerOne => achievements::filler::Filler::title(0),
            Achievement::FillerTwo => achievements::filler::Filler::title(1),
            Achievement::FillerThree => achievements::filler::Filler::title(2),
            Achievement::FillerFour => achievements::filler::Filler::title(3),
            Achievement::FillerFive => achievements::filler::Filler::title(4),
            Achievement::StreakOne => achievements::streak::Streak::title(0),
            Achievement::StreakTwo => achievements::streak::Streak::title(1),
            Achievement::StreakThree => achievements::streak::Streak::title(2),
        }
    }

    #[inline]
    fn description(self: Achievement) -> ByteArray {
        match self {
            Achievement::None => "",
            Achievement::KingI => achievements::king::King::description(0),
            Achievement::KingII => achievements::king::King::description(1),
            Achievement::KingIII => achievements::king::King::description(2),
            Achievement::KingIV => achievements::king::King::description(3),
            Achievement::KingV => achievements::king::King::description(4),
            Achievement::GrinderI => achievements::grinder::Grinder::description(0),
            Achievement::GrinderII => achievements::grinder::Grinder::description(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::description(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::description(3),
            Achievement::GrinderV => achievements::grinder::Grinder::description(4),
            Achievement::ReferenceI => achievements::reference::Reference::description(0),
            Achievement::ReferenceII => achievements::reference::Reference::description(1),
            Achievement::ReferenceIII => achievements::reference::Reference::description(2),
            Achievement::ReferenceIV => achievements::reference::Reference::description(3),
            Achievement::ReferenceV => achievements::reference::Reference::description(4),
            Achievement::FillerOne => achievements::filler::Filler::description(0),
            Achievement::FillerTwo => achievements::filler::Filler::description(1),
            Achievement::FillerThree => achievements::filler::Filler::description(2),
            Achievement::FillerFour => achievements::filler::Filler::description(3),
            Achievement::FillerFive => achievements::filler::Filler::description(4),
            Achievement::StreakOne => achievements::streak::Streak::description(0),
            Achievement::StreakTwo => achievements::streak::Streak::description(1),
            Achievement::StreakThree => achievements::streak::Streak::description(2),
        }
    }

    #[inline]
    fn tasks(self: Achievement) -> Span<ArcadeTask> {
        match self {
            Achievement::None => [].span(),
            Achievement::KingI => achievements::king::King::tasks(0),
            Achievement::KingII => achievements::king::King::tasks(1),
            Achievement::KingIII => achievements::king::King::tasks(2),
            Achievement::KingIV => achievements::king::King::tasks(3),
            Achievement::KingV => achievements::king::King::tasks(4),
            Achievement::GrinderI => achievements::grinder::Grinder::tasks(0),
            Achievement::GrinderII => achievements::grinder::Grinder::tasks(1),
            Achievement::GrinderIII => achievements::grinder::Grinder::tasks(2),
            Achievement::GrinderIV => achievements::grinder::Grinder::tasks(3),
            Achievement::GrinderV => achievements::grinder::Grinder::tasks(4),
            Achievement::ReferenceI => achievements::reference::Reference::tasks(0),
            Achievement::ReferenceII => achievements::reference::Reference::tasks(1),
            Achievement::ReferenceIII => achievements::reference::Reference::tasks(2),
            Achievement::ReferenceIV => achievements::reference::Reference::tasks(3),
            Achievement::ReferenceV => achievements::reference::Reference::tasks(4),
            Achievement::FillerOne => achievements::filler::Filler::tasks(0),
            Achievement::FillerTwo => achievements::filler::Filler::tasks(1),
            Achievement::FillerThree => achievements::filler::Filler::tasks(2),
            Achievement::FillerFour => achievements::filler::Filler::tasks(3),
            Achievement::FillerFive => achievements::filler::Filler::tasks(4),
            Achievement::StreakOne => achievements::streak::Streak::tasks(0),
            Achievement::StreakTwo => achievements::streak::Streak::tasks(1),
            Achievement::StreakThree => achievements::streak::Streak::tasks(2),
        }
    }

    #[inline]
    fn data(self: Achievement) -> ByteArray {
        ""
    }
}

impl IntoAchievementU8 of core::traits::Into<Achievement, u8> {
    #[inline]
    fn into(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
            Achievement::KingI => 1,
            Achievement::KingII => 2,
            Achievement::KingIII => 3,
            Achievement::KingIV => 4,
            Achievement::KingV => 5,
            Achievement::GrinderI => 6,
            Achievement::GrinderII => 7,
            Achievement::GrinderIII => 8,
            Achievement::GrinderIV => 9,
            Achievement::GrinderV => 10,
            Achievement::ReferenceI => 11,
            Achievement::ReferenceII => 12,
            Achievement::ReferenceIII => 13,
            Achievement::ReferenceIV => 14,
            Achievement::ReferenceV => 15,
            Achievement::FillerOne => 16,
            Achievement::FillerTwo => 17,
            Achievement::FillerThree => 18,
            Achievement::FillerFour => 19,
            Achievement::FillerFive => 20,
            Achievement::StreakOne => 21,
            Achievement::StreakTwo => 22,
            Achievement::StreakThree => 23,
        }
    }
}

impl IntoU8Achievement of core::traits::Into<u8, Achievement> {
    #[inline]
    fn into(self: u8) -> Achievement {
        let card: felt252 = self.into();
        match card {
            0 => Achievement::None,
            1 => Achievement::KingI,
            2 => Achievement::KingII,
            3 => Achievement::KingIII,
            4 => Achievement::KingIV,
            5 => Achievement::KingV,
            6 => Achievement::GrinderI,
            7 => Achievement::GrinderII,
            8 => Achievement::GrinderIII,
            9 => Achievement::GrinderIV,
            10 => Achievement::GrinderV,
            11 => Achievement::ReferenceI,
            12 => Achievement::ReferenceII,
            13 => Achievement::ReferenceIII,
            14 => Achievement::ReferenceIV,
            15 => Achievement::ReferenceV,
            16 => Achievement::FillerOne,
            17 => Achievement::FillerTwo,
            18 => Achievement::FillerThree,
            19 => Achievement::FillerFour,
            20 => Achievement::FillerFive,
            21 => Achievement::StreakOne,
            22 => Achievement::StreakTwo,
            23 => Achievement::StreakThree,
            _ => Achievement::None,
        }
    }
}

