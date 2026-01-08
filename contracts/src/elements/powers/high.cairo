use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl High of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        let slot_min = game.slot_min;
        game.slot_min = game.number;
        game.number = game.next(@game.slots(), ref rand);
        game.slot_min = slot_min;
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        // [Check] There is a valid empty slot for next number
        let min: u32 = 0;
        let number = *game.number;
        let mut idx = (*game.slot_count).into() - 1;
        let mut slot = *slots.at(idx);
        while idx > min && slot >= number {
            let previous_slot = *slots.at(idx - 1);
            if slot == 0 {
                return true;
            }
            slot = previous_slot;
            idx -= 1
        }

        // [Check] Rescuable if last slot is empty
        slot == 0
    }
}
