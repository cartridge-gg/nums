use crate::elements::traps;
use crate::helpers::deck::{Deck, DeckTrait};
use crate::helpers::random::{Random, RandomTrait};
use crate::models::game::Game;

// Constants

const MULTIPLIER: u256 = 10000;
pub const TRAP_COUNT: u8 = 5;

#[derive(Drop, Copy, Serde, PartialEq, Debug)]
pub enum Trap {
    None,
    Bomb,
    Lucky,
    Magnet,
    UFO,
    Windy,
}

#[generate_trait]
pub impl TrapImpl of TrapTrait {
    #[inline]
    fn apply(self: Trap, ref game: Game, slot_index: u8, ref rand: Random) {
        match self {
            Trap::None => {},
            Trap::Bomb => traps::bomb::Bomb::apply(ref game, slot_index, ref rand),
            Trap::Lucky => traps::lucky::Lucky::apply(ref game, slot_index, ref rand),
            Trap::Magnet => traps::magnet::Magnet::apply(ref game, slot_index, ref rand),
            Trap::UFO => traps::ufo::Ufo::apply(ref game, slot_index, ref rand),
            Trap::Windy => traps::windy::Windy::apply(ref game, slot_index, ref rand),
        }
    }

    #[inline]
    fn index(self: Trap) -> u8 {
        // [Return] The index of the trap in the bitmap, failing to None
        let index: u8 = self.into();
        index - 1
    }

    #[inline]
    fn generate(count: u8, total: u8, ref random: Random) -> Array<u8> {
        let mut traps: Array<u8> = array![];
        let mut deck = DeckTrait::new(random.next_seed(), TRAP_COUNT.into());
        Self::iter(total, count, ref deck, ref random, ref traps);
        traps
    }

    #[inline]
    fn iter(total: u8, mut count: u8, ref deck: Deck, ref random: Random, ref traps: Array<u8>) {
        // [Check] Stop if all objects are placed
        if count == 0 {
            return;
        }
        // [Compute] Uniform random number between 0 and MULTIPLIER
        let seed = random.next_seed();
        let rng = seed.into() % MULTIPLIER;
        let probability: u256 = count.into() * MULTIPLIER / total.into();
        // [Check] Probability of being an object
        if rng < probability {
            // [Effect] Draw a trap
            traps.append(deck.draw());
            count -= 1;
        } else {
            traps.append(0);
        }
        Self::iter(total - 1, count, ref deck, ref random, ref traps);
    }
}

pub impl TrapIntoU8 of Into<Trap, u8> {
    fn into(self: Trap) -> u8 {
        match self {
            Trap::None => 0,
            Trap::Bomb => 1,
            Trap::Lucky => 2,
            Trap::Magnet => 3,
            Trap::UFO => 4,
            Trap::Windy => 5,
        }
    }
}

pub impl U8IntoTrap of Into<u8, Trap> {
    fn into(self: u8) -> Trap {
        match self {
            0 => Trap::None,
            1 => Trap::Bomb,
            2 => Trap::Lucky,
            3 => Trap::Magnet,
            4 => Trap::UFO,
            5 => Trap::Windy,
            _ => Trap::None,
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::DEFAULT_SLOT_COUNT;
    use super::*;

    #[test]
    fn test_trap_generate() {
        let mut random = RandomTrait::new(0);
        let traps = TrapTrait::generate(TRAP_COUNT, DEFAULT_SLOT_COUNT, ref random);
        assert_eq!(traps, array![0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 3, 2, 5]);
    }
}
