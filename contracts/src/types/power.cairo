use crate::elements::powers;
use crate::models::game::Game;
use crate::random::Random;

pub const POWER_COUNT: u8 = 7;

#[derive(Drop, Copy, Serde)]
pub enum Power {
    None,
    Reroll,
    High,
    Low,
    Foresight,
    DoubleUp,
    Halve,
    Mirror,
}

#[generate_trait]
pub impl PowerImpl of PowerTrait {
    #[inline]
    fn apply(self: Power, ref game: Game, ref rand: Random) {
        match self {
            Power::None => {},
            Power::Reroll => powers::reroll::Reroll::apply(ref game, ref rand),
            Power::High => powers::high::High::apply(ref game, ref rand),
            Power::Low => powers::low::Low::apply(ref game, ref rand),
            Power::Foresight => powers::foresight::Foresight::apply(ref game, ref rand),
            Power::DoubleUp => powers::double_up::DoubleUp::apply(ref game, ref rand),
            Power::Halve => powers::halve::Halve::apply(ref game, ref rand),
            Power::Mirror => powers::mirror::Mirror::apply(ref game, ref rand),
        }
    }

    #[inline]
    fn is_unlocked(self: Power, value: u8) -> bool {
        match self {
            Power::None => false,
            Power::Reroll => value >= powers::reroll::Reroll::condition(),
            Power::High => value >= powers::high::High::condition(),
            Power::Low => value >= powers::low::Low::condition(),
            Power::Foresight => value >= powers::foresight::Foresight::condition(),
            Power::DoubleUp => value >= powers::double_up::DoubleUp::condition(),
            Power::Halve => value >= powers::halve::Halve::condition(),
            Power::Mirror => value >= powers::mirror::Mirror::condition(),
        }
    }

    #[inline]
    fn index(self: Power) -> u8 {
        // [Return] The index of the power in the bitmap, failing to None
        let index: u8 = self.into();
        index - 1
    }

    #[inline]
    fn from(index: u8) -> Power {
        match index {
            0 => Power::Reroll,
            1 => Power::High,
            2 => Power::Low,
            3 => Power::Foresight,
            4 => Power::DoubleUp,
            5 => Power::Halve,
            6 => Power::Mirror,
            _ => Power::None,
        }
    }
}

pub impl PowerIntoU8 of Into<Power, u8> {
    fn into(self: Power) -> u8 {
        match self {
            Power::None => 0,
            Power::Reroll => 1,
            Power::High => 2,
            Power::Low => 3,
            Power::Foresight => 4,
            Power::DoubleUp => 5,
            Power::Halve => 6,
            Power::Mirror => 7,
        }
    }
}

pub impl U8IntoPower of Into<u8, Power> {
    fn into(self: u8) -> Power {
        match self {
            0 => Power::None,
            1 => Power::Reroll,
            2 => Power::High,
            3 => Power::Low,
            4 => Power::Foresight,
            5 => Power::DoubleUp,
            6 => Power::Halve,
            7 => Power::Mirror,
            _ => Power::None,
        }
    }
}
