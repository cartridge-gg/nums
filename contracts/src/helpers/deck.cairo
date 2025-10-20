//! Deck struct and random card drawing methods.

// Core imports

use core::dict::{Felt252Dict, Felt252DictTrait};
use core::hash::HashStateTrait;
use core::poseidon::PoseidonTrait;

// Constants

const TWO_POW_1: u128 = 0x2;
const MASK_1: u128 = 0x1;


/// Deck struct.
#[derive(Destruct)]
pub struct Deck {
    pub seed: felt252,
    pub keys: Felt252Dict<felt252>,
    pub cards: Felt252Dict<u8>,
    pub remaining: u32,
    pub nonce: u8,
}

/// Errors module.
pub mod errors {
    pub const NO_CARDS_LEFT: felt252 = 'Deck: no cards left';
    pub const TOO_MANY_CARDS: felt252 = 'Deck: too many cards';
}

/// Trait to initialize, draw and discard a card from the Deck.
pub trait DeckTrait {
    /// Returns a new `Deck` struct.
    /// # Arguments
    /// * `seed` - A seed to initialize the deck.
    /// * `number` - The initial number of cards.
    /// # Returns
    /// * The initialized `Deck`.
    fn new(seed: felt252, number: u32) -> Deck;
    /// Returns a new `Deck` struct setup with a bitmap.
    /// # Arguments
    /// * `seed` - A seed to initialize the deck.
    /// * `number` - The initial number of cards (must be below u128).
    /// * `bitmap` - The bitmap, each bit is a card with: 0/1 is in/out (so a null bitmap will
    /// create a `new` deck).
    /// # Returns
    /// * The initialized `Deck`.
    fn from_bitmap(seed: felt252, number: u32, bitmap: u128) -> Deck;
    /// Returns a card type after a draw.
    /// # Arguments
    /// * `self` - The Deck.
    /// # Returns
    /// * The card type.
    fn draw(ref self: Deck) -> u8;
    /// Returns a card into the deck, the card becomes drawable.
    /// # Arguments
    /// * `self` - The Deck.
    /// * `card` - The card to discard.
    fn discard(ref self: Deck, card: u8);
    /// Withdraw a card from the deck, the card is not drawable anymore.
    /// # Arguments
    /// * `self` - The Deck.
    /// * `card` - The card to withdraw.
    fn withdraw(ref self: Deck, card: u8);
    /// Remove the cards from the deck, they are not drawable anymore.
    /// # Arguments
    /// * `self` - The Deck.
    /// * `cards` - The card to set.
    fn remove(ref self: Deck, cards: Span<u8>);
    /// Shuffle the deck.
    /// # Arguments
    /// * `self` - The Deck.
    fn shuffle(self: @Deck) -> felt252;
}

/// Implementation of the `DeckTrait` trait for the `Deck` struct.
pub impl DeckImpl of DeckTrait {
    #[inline]
    fn new(seed: felt252, number: u32) -> Deck {
        let mut deck = Deck {
            seed, cards: Default::default(), keys: Default::default(), remaining: number, nonce: 0,
        };
        deck.seed = deck.shuffle();
        deck
    }

    fn from_bitmap(seed: felt252, number: u32, mut bitmap: u128) -> Deck {
        assert(number <= 128, errors::TOO_MANY_CARDS);
        let mut deck = Self::new(seed, number);
        let mut card: u8 = 1;
        while bitmap != 0 && card.into() <= number {
            if bitmap & MASK_1 == 1 {
                deck.withdraw(card);
            }
            bitmap /= TWO_POW_1;
            card += 1;
        }
        deck
    }

    #[inline]
    fn draw(ref self: Deck) -> u8 {
        // [Check] Enough cards left.
        assert(self.remaining > 0, errors::NO_CARDS_LEFT);
        // [Compute] Draw a random card from remainingcs cards.
        let random: u256 = self.shuffle().into();
        let key: felt252 = (random % self.remaining.into() + 1).try_into().unwrap();
        let mut card: u8 = self.cards.get(key);
        if 0 == card.into() {
            card = key.try_into().unwrap();
        }
        // [Compute] Remove card from the deck.
        self.withdraw(card);
        self.nonce += 1;
        card
    }

    #[inline]
    fn discard(ref self: Deck, card: u8) {
        self.remaining += 1;
        self.cards.insert(self.remaining.into(), card);
    }

    #[inline]
    fn withdraw(ref self: Deck, card: u8) {
        let mut key = self.keys.get(card.into());
        if key == 0 {
            key = card.into();
        }
        let latest_key: felt252 = self.remaining.into();
        if latest_key != key {
            let mut latest_card: u8 = self.cards.get(latest_key);
            if latest_card == 0 {
                latest_card = latest_key.try_into().unwrap();
            }
            self.cards.insert(key, latest_card);
            self.keys.insert(latest_card.into(), key);
        }
        self.remaining -= 1;
    }

    fn remove(ref self: Deck, mut cards: Span<u8>) {
        while let Option::Some(card) = cards.pop_front() {
            self.withdraw(*card);
        }
    }

    #[inline]
    fn shuffle(self: @Deck) -> felt252 {
        let mut state = PoseidonTrait::new();
        state = state.update(*self.seed);
        state = state.update((*self.nonce).into());
        state = state.update((*self.remaining).into());
        state.finalize().into()
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::DeckTrait;

    // Constants

    const DECK_CARDS_NUMBER: u32 = 5;
    const DECK_SEED: felt252 = 'SEED';

    #[test]
    fn test_deck_new_draw() {
        let mut deck = DeckTrait::new(DECK_SEED, DECK_CARDS_NUMBER);
        assert(deck.remaining == DECK_CARDS_NUMBER, 'Wrong remaining');
        assert(deck.draw() == 0x1, 'Wrong card 01');
        assert(deck.draw() == 0x2, 'Wrong card 02');
        assert(deck.draw() == 0x5, 'Wrong card 03');
        assert(deck.draw() == 0x4, 'Wrong card 04');
        assert(deck.draw() == 0x3, 'Wrong card 05');
        assert(deck.remaining == 0, 'Wrong remaining');
    }

    #[test]
    fn test_deck_from_bitmap() {
        let bitmap: u128 = 0x4;
        let mut deck = DeckTrait::from_bitmap(DECK_SEED, DECK_CARDS_NUMBER, bitmap);
        assert(deck.remaining == DECK_CARDS_NUMBER - 1, 'Wrong remaining');
        assert(deck.draw() == 0x1, 'Wrong card 01');
        assert(deck.draw() == 0x2, 'Wrong card 02');
        assert(deck.draw() == 0x4, 'Wrong card 03');
        assert(deck.draw() == 0x5, 'Wrong card 04');
        assert(deck.remaining == 0, 'Wrong remaining');
    }

    #[test]
    fn test_deck_new_withdraw() {
        let mut deck = DeckTrait::new(DECK_SEED, DECK_CARDS_NUMBER);
        deck.withdraw(0x2);
        assert(deck.draw() == 0x1, 'Wrong card 01');
        assert(deck.draw() == 0x5, 'Wrong card 02');
        assert(deck.draw() == 0x4, 'Wrong card 03');
        assert(deck.draw() == 0x3, 'Wrong card 04');
        assert(deck.remaining == 0, 'Wrong remaining');
    }

    #[test]
    #[should_panic(expected: ('Deck: no cards left',))]
    fn test_deck_new_draw_revert_no_card_left() {
        let mut deck = DeckTrait::new(DECK_SEED, DECK_CARDS_NUMBER);
        deck.remaining = 0;
        deck.draw();
    }

    #[test]
    fn test_deck_new_discard() {
        let mut deck = DeckTrait::new(DECK_SEED, DECK_CARDS_NUMBER);
        while deck.remaining > 0 {
            deck.draw();
        }
        let card: u8 = 0x11;
        deck.discard(card);
        assert(deck.draw() == card, 'Wrong card');
    }

    #[test]
    fn test_deck_new_remove() {
        let mut deck = DeckTrait::new(DECK_SEED, DECK_CARDS_NUMBER);
        let mut cards: Array<u8> = array![];
        let mut card: u8 = 1;
        while card.into() <= DECK_CARDS_NUMBER {
            cards.append(card);
            card += 1;
        }
        deck.remove(cards.span());
        let card: u8 = 0x11;
        deck.discard(card);
        assert(deck.draw() == card, 'Wrong card');
    }
}
