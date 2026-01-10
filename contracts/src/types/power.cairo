use crate::elements::powers;
use crate::helpers::deck::DeckTrait;
use crate::models::game::Game;
use crate::random::Random;

pub const POWER_COUNT: u8 = 7;

#[derive(Drop, Copy, Serde, PartialEq, Debug)]
pub enum Power {
    None,
    Reroll,
    High,
    Low,
    Swap,
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
            Power::Swap => powers::swap::Swap::apply(ref game, ref rand),
            Power::DoubleUp => powers::double_up::DoubleUp::apply(ref game, ref rand),
            Power::Halve => powers::halve::Halve::apply(ref game, ref rand),
            Power::Mirror => powers::mirror::Mirror::apply(ref game, ref rand),
        }
    }

    #[inline]
    fn rescue(self: Power, game: @Game, slots: @Array<u16>) -> bool {
        match self {
            Power::None => false,
            Power::Reroll => powers::reroll::Reroll::rescue(game, slots),
            Power::High => powers::high::High::rescue(game, slots),
            Power::Low => powers::low::Low::rescue(game, slots),
            Power::Swap => powers::swap::Swap::rescue(game, slots),
            Power::DoubleUp => powers::double_up::DoubleUp::rescue(game, slots),
            Power::Halve => powers::halve::Halve::rescue(game, slots),
            Power::Mirror => powers::mirror::Mirror::rescue(game, slots),
        }
    }

    #[inline]
    fn index(self: Power) -> u8 {
        // [Return] The index of the power in the bitmap, failing to None
        let index: u8 = self.into();
        index - 1
    }

    #[inline]
    fn draw(seed: felt252, count: u8) -> Array<u8> {
        let mut deck = DeckTrait::new(seed, POWER_COUNT.into());
        array![deck.draw(), deck.draw()]
    }
}

pub impl PowerIntoU8 of Into<Power, u8> {
    fn into(self: Power) -> u8 {
        match self {
            Power::None => 0,
            Power::Reroll => 1,
            Power::High => 2,
            Power::Low => 3,
            Power::Swap => 4,
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
            4 => Power::Swap,
            5 => Power::DoubleUp,
            6 => Power::Halve,
            7 => Power::Mirror,
            _ => Power::None,
        }
    }
}
