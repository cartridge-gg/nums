use achievement::types::task::{Task as ArcadeTask};
use nums::elements::achievements;

// Constants

// TODO: Enable the king of the hill achievements
// pub const ACHIEVEMENT_COUNT: u8 = 30;
pub const ACHIEVEMENT_COUNT: u8 = 25;

// Typ

#[derive(Copy, Drop)]
pub enum Achievement {
    None,
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
    ReferenceVI,
    ReferenceVII,
    FillerOne,
    FillerTwo,
    FillerThree,
    FillerFour,
    FillerFive,
    StreakOne,
    StreakTwo,
    StreakThree,
    ClaimerOne,
    ClaimerTwo,
    ClaimerThree,
    ClaimerFour,
    ClaimerFive,
    KingI,
    KingII,
    KingIII,
    KingIV,
    KingV,
}

#[generate_trait]
pub impl AchievementImpl of AchievementTrait {
    
    fn identifier(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
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
            Achievement::ReferenceVI => achievements::reference::Reference::identifier(5),
            Achievement::ReferenceVII => achievements::reference::Reference::identifier(6),
            Achievement::FillerOne => achievements::filler::Filler::identifier(0),
            Achievement::FillerTwo => achievements::filler::Filler::identifier(1),
            Achievement::FillerThree => achievements::filler::Filler::identifier(2),
            Achievement::FillerFour => achievements::filler::Filler::identifier(3),
            Achievement::FillerFive => achievements::filler::Filler::identifier(4),
            Achievement::StreakOne => achievements::streak::Streak::identifier(0),
            Achievement::StreakTwo => achievements::streak::Streak::identifier(1),
            Achievement::StreakThree => achievements::streak::Streak::identifier(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::identifier(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::identifier(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::identifier(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::identifier(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::identifier(4),
            Achievement::KingI => achievements::king::King::identifier(0),
            Achievement::KingII => achievements::king::King::identifier(1),
            Achievement::KingIII => achievements::king::King::identifier(2),
            Achievement::KingIV => achievements::king::King::identifier(3),
            Achievement::KingV => achievements::king::King::identifier(4),
        }
    }

    
    fn hidden(self: Achievement) -> bool {
        match self {
            Achievement::None => true,
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
            Achievement::ReferenceVI => achievements::reference::Reference::hidden(5),
            Achievement::ReferenceVII => achievements::reference::Reference::hidden(6),
            Achievement::FillerOne => achievements::filler::Filler::hidden(0),
            Achievement::FillerTwo => achievements::filler::Filler::hidden(1),
            Achievement::FillerThree => achievements::filler::Filler::hidden(2),
            Achievement::FillerFour => achievements::filler::Filler::hidden(3),
            Achievement::FillerFive => achievements::filler::Filler::hidden(4),
            Achievement::StreakOne => achievements::streak::Streak::hidden(0),
            Achievement::StreakTwo => achievements::streak::Streak::hidden(1),
            Achievement::StreakThree => achievements::streak::Streak::hidden(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::hidden(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::hidden(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::hidden(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::hidden(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::hidden(4),
            Achievement::KingI => achievements::king::King::hidden(0),
            Achievement::KingII => achievements::king::King::hidden(1),
            Achievement::KingIII => achievements::king::King::hidden(2),
            Achievement::KingIV => achievements::king::King::hidden(3),
            Achievement::KingV => achievements::king::King::hidden(4),
        }
    }

    
    fn index(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
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
            Achievement::ReferenceVI => achievements::reference::Reference::index(5),
            Achievement::ReferenceVII => achievements::reference::Reference::index(6),
            Achievement::FillerOne => achievements::filler::Filler::index(0),
            Achievement::FillerTwo => achievements::filler::Filler::index(1),
            Achievement::FillerThree => achievements::filler::Filler::index(2),
            Achievement::FillerFour => achievements::filler::Filler::index(3),
            Achievement::FillerFive => achievements::filler::Filler::index(4),
            Achievement::StreakOne => achievements::streak::Streak::index(0),
            Achievement::StreakTwo => achievements::streak::Streak::index(1),
            Achievement::StreakThree => achievements::streak::Streak::index(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::index(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::index(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::index(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::index(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::index(4),
            Achievement::KingI => achievements::king::King::index(0),
            Achievement::KingII => achievements::king::King::index(1),
            Achievement::KingIII => achievements::king::King::index(2),
            Achievement::KingIV => achievements::king::King::index(3),
            Achievement::KingV => achievements::king::King::index(4),
        }
    }

    
    fn points(self: Achievement) -> u16 {
        match self {
            Achievement::None => 0,
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
            Achievement::ReferenceVI => achievements::reference::Reference::points(5),
            Achievement::ReferenceVII => achievements::reference::Reference::points(6),
            Achievement::FillerOne => achievements::filler::Filler::points(0),
            Achievement::FillerTwo => achievements::filler::Filler::points(1),
            Achievement::FillerThree => achievements::filler::Filler::points(2),
            Achievement::FillerFour => achievements::filler::Filler::points(3),
            Achievement::FillerFive => achievements::filler::Filler::points(4),
            Achievement::StreakOne => achievements::streak::Streak::points(0),
            Achievement::StreakTwo => achievements::streak::Streak::points(1),
            Achievement::StreakThree => achievements::streak::Streak::points(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::points(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::points(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::points(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::points(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::points(4),
            Achievement::KingI => achievements::king::King::points(0),
            Achievement::KingII => achievements::king::King::points(1),
            Achievement::KingIII => achievements::king::King::points(2),
            Achievement::KingIV => achievements::king::King::points(3),
            Achievement::KingV => achievements::king::King::points(4),
        }
    }

    
    fn group(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
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
            Achievement::ReferenceVI => achievements::reference::Reference::group(),
            Achievement::ReferenceVII => achievements::reference::Reference::group(),
            Achievement::FillerOne => achievements::filler::Filler::group(),
            Achievement::FillerTwo => achievements::filler::Filler::group(),
            Achievement::FillerThree => achievements::filler::Filler::group(),
            Achievement::FillerFour => achievements::filler::Filler::group(),
            Achievement::FillerFive => achievements::filler::Filler::group(),
            Achievement::StreakOne => achievements::streak::Streak::group(),
            Achievement::StreakTwo => achievements::streak::Streak::group(),
            Achievement::StreakThree => achievements::streak::Streak::group(),
            Achievement::ClaimerOne => achievements::claimer::Claimer::group(),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::group(),
            Achievement::ClaimerThree => achievements::claimer::Claimer::group(),
            Achievement::ClaimerFour => achievements::claimer::Claimer::group(),
            Achievement::ClaimerFive => achievements::claimer::Claimer::group(),
            Achievement::KingI => achievements::king::King::group(),
            Achievement::KingII => achievements::king::King::group(),
            Achievement::KingIII => achievements::king::King::group(),
            Achievement::KingIV => achievements::king::King::group(),
            Achievement::KingV => achievements::king::King::group(),
        }
    }

    
    fn icon(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
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
            Achievement::ReferenceVI => achievements::reference::Reference::icon(5),
            Achievement::ReferenceVII => achievements::reference::Reference::icon(6),
            Achievement::FillerOne => achievements::filler::Filler::icon(0),
            Achievement::FillerTwo => achievements::filler::Filler::icon(1),
            Achievement::FillerThree => achievements::filler::Filler::icon(2),
            Achievement::FillerFour => achievements::filler::Filler::icon(3),
            Achievement::FillerFive => achievements::filler::Filler::icon(4),
            Achievement::StreakOne => achievements::streak::Streak::icon(0),
            Achievement::StreakTwo => achievements::streak::Streak::icon(1),
            Achievement::StreakThree => achievements::streak::Streak::icon(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::icon(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::icon(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::icon(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::icon(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::icon(4),
            Achievement::KingI => achievements::king::King::icon(0),
            Achievement::KingII => achievements::king::King::icon(1),
            Achievement::KingIII => achievements::king::King::icon(2),
            Achievement::KingIV => achievements::king::King::icon(3),
            Achievement::KingV => achievements::king::King::icon(4),
        }
    }

    
    fn title(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
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
            Achievement::ReferenceVI => achievements::reference::Reference::title(5),
            Achievement::ReferenceVII => achievements::reference::Reference::title(6),
            Achievement::FillerOne => achievements::filler::Filler::title(0),
            Achievement::FillerTwo => achievements::filler::Filler::title(1),
            Achievement::FillerThree => achievements::filler::Filler::title(2),
            Achievement::FillerFour => achievements::filler::Filler::title(3),
            Achievement::FillerFive => achievements::filler::Filler::title(4),
            Achievement::StreakOne => achievements::streak::Streak::title(0),
            Achievement::StreakTwo => achievements::streak::Streak::title(1),
            Achievement::StreakThree => achievements::streak::Streak::title(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::title(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::title(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::title(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::title(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::title(4),
            Achievement::KingI => achievements::king::King::title(0),
            Achievement::KingII => achievements::king::King::title(1),
            Achievement::KingIII => achievements::king::King::title(2),
            Achievement::KingIV => achievements::king::King::title(3),
            Achievement::KingV => achievements::king::King::title(4),
        }
    }

    
    fn description(self: Achievement) -> ByteArray {
        match self {
            Achievement::None => "",
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
            Achievement::ReferenceVI => achievements::reference::Reference::description(5),
            Achievement::ReferenceVII => achievements::reference::Reference::description(6),
            Achievement::FillerOne => achievements::filler::Filler::description(0),
            Achievement::FillerTwo => achievements::filler::Filler::description(1),
            Achievement::FillerThree => achievements::filler::Filler::description(2),
            Achievement::FillerFour => achievements::filler::Filler::description(3),
            Achievement::FillerFive => achievements::filler::Filler::description(4),
            Achievement::StreakOne => achievements::streak::Streak::description(0),
            Achievement::StreakTwo => achievements::streak::Streak::description(1),
            Achievement::StreakThree => achievements::streak::Streak::description(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::description(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::description(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::description(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::description(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::description(4),
            Achievement::KingI => achievements::king::King::description(0),
            Achievement::KingII => achievements::king::King::description(1),
            Achievement::KingIII => achievements::king::King::description(2),
            Achievement::KingIV => achievements::king::King::description(3),
            Achievement::KingV => achievements::king::King::description(4),
        }
    }

    
    fn tasks(self: Achievement) -> Span<ArcadeTask> {
        match self {
            Achievement::None => [].span(),
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
            Achievement::ReferenceVI => achievements::reference::Reference::tasks(5),
            Achievement::ReferenceVII => achievements::reference::Reference::tasks(6),
            Achievement::FillerOne => achievements::filler::Filler::tasks(0),
            Achievement::FillerTwo => achievements::filler::Filler::tasks(1),
            Achievement::FillerThree => achievements::filler::Filler::tasks(2),
            Achievement::FillerFour => achievements::filler::Filler::tasks(3),
            Achievement::FillerFive => achievements::filler::Filler::tasks(4),
            Achievement::StreakOne => achievements::streak::Streak::tasks(0),
            Achievement::StreakTwo => achievements::streak::Streak::tasks(1),
            Achievement::StreakThree => achievements::streak::Streak::tasks(2),
            Achievement::ClaimerOne => achievements::claimer::Claimer::tasks(0),
            Achievement::ClaimerTwo => achievements::claimer::Claimer::tasks(1),
            Achievement::ClaimerThree => achievements::claimer::Claimer::tasks(2),
            Achievement::ClaimerFour => achievements::claimer::Claimer::tasks(3),
            Achievement::ClaimerFive => achievements::claimer::Claimer::tasks(4),
            Achievement::KingI => achievements::king::King::tasks(0),
            Achievement::KingII => achievements::king::King::tasks(1),
            Achievement::KingIII => achievements::king::King::tasks(2),
            Achievement::KingIV => achievements::king::King::tasks(3),
            Achievement::KingV => achievements::king::King::tasks(4),
        }
    }

    
    fn data(self: Achievement) -> ByteArray {
        ""
    }
}

impl IntoAchievementU8 of core::traits::Into<Achievement, u8> {
    
    fn into(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
            Achievement::GrinderI => 1,
            Achievement::GrinderII => 2,
            Achievement::GrinderIII => 3,
            Achievement::GrinderIV => 4,
            Achievement::GrinderV => 5,
            Achievement::ReferenceI => 6,
            Achievement::ReferenceII => 7,
            Achievement::ReferenceIII => 8,
            Achievement::ReferenceIV => 9,
            Achievement::ReferenceV => 10,
            Achievement::ReferenceVI => 11,
            Achievement::ReferenceVII => 12,
            Achievement::FillerOne => 13,
            Achievement::FillerTwo => 14,
            Achievement::FillerThree => 15,
            Achievement::FillerFour => 16,
            Achievement::FillerFive => 17,
            Achievement::StreakOne => 18,
            Achievement::StreakTwo => 19,
            Achievement::StreakThree => 20,
            Achievement::ClaimerOne => 21,
            Achievement::ClaimerTwo => 22,
            Achievement::ClaimerThree => 23,
            Achievement::ClaimerFour => 24,
            Achievement::ClaimerFive => 25,
            Achievement::KingI => 26,
            Achievement::KingII => 27,
            Achievement::KingIII => 28,
            Achievement::KingIV => 29,
            Achievement::KingV => 30,
        }
    }
}

impl IntoU8Achievement of core::traits::Into<u8, Achievement> {
    
    fn into(self: u8) -> Achievement {
        let card: felt252 = self.into();
        match card {
            0 => Achievement::None,
            1 => Achievement::GrinderI,
            2 => Achievement::GrinderII,
            3 => Achievement::GrinderIII,
            4 => Achievement::GrinderIV,
            5 => Achievement::GrinderV,
            6 => Achievement::ReferenceI,
            7 => Achievement::ReferenceII,
            8 => Achievement::ReferenceIII,
            9 => Achievement::ReferenceIV,
            10 => Achievement::ReferenceV,
            11 => Achievement::ReferenceVI,
            12 => Achievement::ReferenceVII,
            13 => Achievement::FillerOne,
            14 => Achievement::FillerTwo,
            15 => Achievement::FillerThree,
            16 => Achievement::FillerFour,
            17 => Achievement::FillerFive,
            18 => Achievement::StreakOne,
            19 => Achievement::StreakTwo,
            20 => Achievement::StreakThree,
            21 => Achievement::ClaimerOne,
            22 => Achievement::ClaimerTwo,
            23 => Achievement::ClaimerThree,
            24 => Achievement::ClaimerFour,
            25 => Achievement::ClaimerFive,
            26 => Achievement::KingI,
            27 => Achievement::KingII,
            28 => Achievement::KingIII,
            29 => Achievement::KingIV,
            30 => Achievement::KingV,
            _ => Achievement::None,
        }
    }
}

