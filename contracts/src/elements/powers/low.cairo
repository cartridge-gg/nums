use crate::elements::powers::interface::{Game, GameTrait, PowerTrait, Random};

pub impl Low of PowerTrait {
    #[inline]
    fn apply(ref game: Game, ref rand: Random) {
        let slot_max = game.slot_max;
        game.slot_max = game.number;
        game.number = game.next(@game.slots(), ref rand);
        game.slot_max = slot_max;
    }

    #[inline]
    fn rescue(game: @Game, slots: @Array<u16>) -> bool {
        // [Check] There is a valid empty slot for next number
        let max: u32 = (*game.slot_count).into() - 1;
        let number = *game.number;
        let mut idx = 0;
        let mut slot = *slots.at(idx);
        while idx < max && slot <= number {
            let next_slot = *slots.at(idx + 1);
            if slot == 0 {
                return true;
            }
            slot = next_slot;
            idx += 1
        }

        // [Check] Rescuable if last slot is empty
        slot == 0
    }
}
