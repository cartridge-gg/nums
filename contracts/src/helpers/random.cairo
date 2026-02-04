use core::poseidon::poseidon_hash_span;
use starknet::get_contract_address;
use crate::interfaces::vrf::{IVrfProviderDispatcher, IVrfProviderDispatcherTrait, Source};


#[derive(Copy, Drop, Serde)]
pub struct Random {
    pub seed: felt252,
    pub nonce: usize,
}

#[generate_trait]
pub impl RandomImpl of RandomTrait {
    fn new(salt: felt252) -> Random {
        Random { seed: seed(salt), nonce: 0 }
    }

    // https://docs.cartridge.gg/vrf/overview
    fn new_vrf(vrf_provider_disp: IVrfProviderDispatcher) -> Random {
        let seed = vrf_provider_disp.consume_random(Source::Nonce(get_contract_address()));
        Random { seed, nonce: 0 }
    }

    fn next_seed(ref self: Random) -> felt252 {
        self.nonce += 1;
        self.seed = poseidon_hash_span([self.seed, self.nonce.into()].span());
        self.seed
    }

    fn bool(ref self: Random) -> bool {
        let seed: u256 = self.next_seed().into();
        seed.low % 2 == 0
    }

    fn felt(ref self: Random) -> felt252 {
        let tx_hash = starknet::get_tx_info().unbox().transaction_hash;
        let seed = self.next_seed();
        poseidon_hash_span([tx_hash, seed].span())
    }

    fn occurs(ref self: Random, likelihood: u8) -> bool {
        if likelihood == 0 {
            return false;
        }

        let result = self.between::<u8>(0, 100);
        result <= likelihood
    }

    fn between<
        T, +Into<T, u128>, +Into<T, u256>, +TryInto<u128, T>, +PartialOrd<T>, +Copy<T>, +Drop<T>,
    >(
        ref self: Random, min: T, max: T,
    ) -> T {
        let seed: u256 = self.next_seed().into();

        assert(min <= max, 'min must be less than max');

        let range: u128 = max.into() - min.into() + 1; // includes max
        let rand = (seed.low % range) + min.into();
        rand.try_into().unwrap()
    }

    /// Generates a random number between min and max that is not already present in the slots
    /// array.
    ///
    /// # Arguments
    ///
    /// * `min` - The minimum value (inclusive).
    /// * `max` - The maximum value (inclusive).
    /// * `slots` - An array of u16 representing existing values to avoid.
    ///
    /// # Returns
    ///
    /// * `u16` - A random number between min and max that is not in the slots array.
    fn next_unique(ref self: Random, min: u16, max: u16, slots: @Array<u16>) -> u16 {
        // [Compute] Draw a random number between the min and max
        let random = self.between::<u16>(min, max);
        // [Check] If the number is already in the slots
        let mut reroll = false;
        let mut idx = 0_u32;
        let len = slots.len();
        while idx < len {
            if *slots.at(idx) == random {
                reroll = true;
                break;
            }
            idx += 1;
        }
        // [Return] Reroll if the number is already in the slots
        match reroll {
            true => self.next_unique(min, max, slots),
            false => random,
        }
    }
}

fn seed(salt: felt252) -> felt252 {
    poseidon_hash_span([starknet::get_tx_info().unbox().transaction_hash, salt].span())
}
