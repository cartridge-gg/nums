use core::array::ArrayTrait;
use nums::{Store, StoreImpl, StoreTrait};
use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u32,
    #[key]
    pub player: ContractAddress,
    pub max_slots: u8,
    pub max_number: u16,
    pub min_number: u16,
    pub remaining_slots: u8,
    pub next_number: u16,
    pub reward: u32,
    pub jackpot_id: u32,
    pub expires_at: u64,
    pub game_over: bool,
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    /// Checks if the elements in the given array of slots are in ascending order.
    ///
    /// # Arguments
    /// * `self` - A reference to the current game instance.
    /// * `nums` - An array of `u16` numbers representing the slots to be checked.
    ///
    /// # Returns
    /// A boolean value indicating whether the elements in the slots array are in ascending order.
    fn is_valid(self: @Game, nums: @Array<u16>) -> bool {
        let len = nums.len();
        if len == 1 {
            return true;
        }

        let mut valid = true;
        let mut idx = 0;

        while idx < (len - 1) {
            if *nums.at(idx) > *nums.at(idx + 1) {
                valid = false;
                break;
            }
            idx += 1;
        }

        valid
    }

    fn has_expired(self: @Game) -> bool {
        starknet::get_block_timestamp() >= *self.expires_at
    }

    fn is_game_over(self: @Game, ref store: Store) -> bool {
        if *self.remaining_slots == 0 {
            return true;
        }

        let next_number = *self.next_number;
        let mut max_slots = *self.max_slots;
        let mut idx = 0;

        let mut slot = store.slot(*self.game_id, *self.player, idx);
        let mut prev_number = 0;

        while idx < (max_slots - 1) {
            let next_slot = store.slot(*self.game_id, *self.player, idx + 1);

            if slot.number == 0 && next_number < next_slot.number && next_number > prev_number {
                return false;
            }
            if slot.number != 0 && next_number < slot.number {
                return true;
            }

            prev_number = slot.number;
            slot = next_slot;
            idx += 1
        }
        // check if last slot is empty

        println!("slot: {:?}", slot);
        if slot.number == 0 && next_number > prev_number {
            return false;
        }

        true
    }

    fn level(self: @Game) -> u8 {
        (*self.max_slots - *self.remaining_slots)
    }
}
