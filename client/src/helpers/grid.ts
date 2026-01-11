export const Grid = {
  closests: (slots: Array<number>, number: number): [number, number] => {
    // Return 2 indexes closest lower and higher to the number
    let closest_lower = -1;
    let closest_higher = -1;
    for (let idx = 0; idx < slots.length; idx++) {
      const slot = slots[idx];
      if (slot < number && slot !== 0) {
        closest_lower = idx;
      }
      if (slot > number && slot !== 0) {
        closest_higher = idx;
        break;
      }
    }
    return [closest_lower, closest_higher];
  },

  alloweds: (slots: Array<number>, number: number): number[] => {
    // Return the indexes of the slots that are allowed to be set based on the number
    const [low, high] = Grid.closests(slots, number);
    if (high === -1 && low === -1)
      return Array.from({ length: slots.length }, (_, idx) => idx);
    if (high === low) return [];
    if (low === -1) return Array.from({ length: high }, (_, idx) => idx);
    if (high === -1)
      return Array.from(
        { length: slots.length - low - 1 },
        (_, idx) => low + idx + 1,
      );
    return Array.from({ length: high - low - 1 }, (_, idx) => low + idx + 1);
  },
};
