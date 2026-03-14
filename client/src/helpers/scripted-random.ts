/**
 * ScriptedRandom - Duck-types the Random class but returns queued values.
 * Used by tutorial action steps so GameEngine calls produce deterministic results.
 */
export class ScriptedRandom {
  private queue: bigint[];
  private index: number;

  constructor(seeds: bigint[]) {
    this.queue = seeds;
    this.index = 0;
  }

  /**
   * Generate next seed from the queue, or return fallback
   */
  nextSeed(): bigint {
    if (this.index < this.queue.length) {
      return this.queue[this.index++];
    }
    return 999n;
  }

  /**
   * Generate a random boolean from the queue
   */
  bool(): boolean {
    const seed = this.nextSeed();
    const low = seed & 0xffffffffffffffffffffffffffffffffn;
    return Number(low % 2n) === 0;
  }

  /**
   * Generate a random number between min and max (inclusive) from the queue
   */
  between<T extends number>(min: T, max: T): T {
    const seed = this.nextSeed();
    const low = seed & 0xffffffffffffffffffffffffffffffffn;
    const range = BigInt(max) - BigInt(min) + 1n;
    const rand = (low % range) + BigInt(min);
    return Number(rand) as T;
  }

  /**
   * Check if an event occurs based on likelihood (0-100)
   */
  occurs(likelihood: number): boolean {
    if (likelihood === 0) return false;
    const result = this.between<number>(0, 100);
    return result <= likelihood;
  }

  /**
   * Generate a random number between min and max that is not in slots
   */
  nextUnique(min: number, max: number, slots: number[]): number {
    const random = this.between<number>(min, max);
    const reroll = slots.includes(random);
    return reroll ? this.nextUnique(min, max, slots) : random;
  }
}
