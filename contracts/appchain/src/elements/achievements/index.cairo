use achievement::types::task::{Task as ArcadeTask};
use nums_appchain::elements::achievements;

// Constants

pub const ACHIEVEMENT_COUNT: u8 = 5;

// Typ

#[derive(Copy, Drop)]
pub enum Achievement {
    None,
    KingI,
    KingII,
    KingIII,
    KingIV,
    KingV,
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
            _ => Achievement::None,
        }
    }
}

