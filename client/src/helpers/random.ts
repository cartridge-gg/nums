import { hash } from "starknet";

/**
 * Random number generator for practice mode
 * Equivalent to helpers/random.cairo
 */

export class Random {
  private seed: bigint;
  private nonce: number;

  constructor(salt: bigint) {
    this.seed = this.hashSeed(salt);
    this.nonce = 0;
  }

  /**
   * Generate next seed for random number generation
   * Equivalent to next_seed in Cairo
   */
  nextSeed(): bigint {
    this.nonce += 1;
    // Simple hash function using poseidon-like operations
    // For practice mode, we use a simplified version
    this.seed = BigInt(
      hash.computePoseidonHashOnElements([this.seed, BigInt(this.nonce)]),
    );
    return this.seed;
  }

  /**
   * Generate a random boolean
   * Equivalent to bool in Cairo
   */
  bool(): boolean {
    const seed = this.nextSeed();
    // In Cairo: seed.low % 2 == 0
    // seed.low is the lower 128 bits of a u256
    const low = seed & 0xffffffffffffffffffffffffffffffffn; // 128 bits mask
    return Number(low % 2n) === 0;
  }

  /**
   * Generate a random number between min and max (inclusive)
   * Equivalent to between in Cairo
   */
  between<T extends number>(min: T, max: T): T {
    const seed = this.nextSeed();
    // In Cairo: seed.low % range + min
    // seed.low is the lower 128 bits of a u256
    const low = seed & 0xffffffffffffffffffffffffffffffffn; // 128 bits mask
    const range = BigInt(max) - BigInt(min) + 1n; // includes max
    const rand = (low % range) + BigInt(min);
    return Number(rand) as T;
  }

  /**
   * Check if an event occurs based on likelihood (0-100)
   * Equivalent to occurs in Cairo
   */
  occurs(likelihood: number): boolean {
    if (likelihood === 0) {
      return false;
    }
    const result = this.between<number>(0, 100);
    return result <= likelihood;
  }

  /**
   * Generate a random number between min and max that is not already present in slots
   * Equivalent to next_unique in Cairo
   */
  nextUnique(min: number, max: number, slots: number[]): number {
    // [Compute] Draw a random number between the min and max
    const random = this.between<number>(min, max);
    // [Check] If the number is already in the slots
    const reroll = slots.includes(random);
    // [Return] Reroll if the number is already in the slots
    return reroll ? this.nextUnique(min, max, slots) : random;
  }

  /**
   * Hash function for seed generation using Poseidon
   * Equivalent to seed function in helpers/random.cairo
   */
  private hashSeed(salt: bigint): bigint {
    // In Cairo: poseidon_hash_span([tx_hash, salt].span())
    // For practice mode, we use a mock tx_hash (0n)
    const txHash = 0n; // Mock transaction hash for practice mode
    const hashResult = hash.computePoseidonHashOnElements([txHash, salt]);
    return BigInt(hashResult);
  }
}
