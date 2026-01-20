import { Packer } from "@/helpers/packer";
import { Power } from "@/types/power";
import type { RawGame } from "@/models";

const MODEL_NAME = "Game";
const SLOT_SIZE = 12n;
export const REWARDS: number[] = [
  0, 1, 4, 10, 20, 35, 60, 100, 160, 225, 300, 600, 900, 1800, 2500, 4000, 6500,
  8000, 10000, 20000, 42000,
];

// Constants matching rewarder.cairo
const NUMERATOR = 270_000_000_000n;
const MIN_REWARD = 1n;

export class Game {
  type = MODEL_NAME;

  constructor(
    public id: number,
    public over: boolean,
    public claimed: boolean,
    public level: number,
    public slot_count: number,
    public slot_min: number,
    public slot_max: number,
    public number: number,
    public next_number: number,
    public selected_powers: Power[],
    public selectable_powers: Power[],
    public available_powers: boolean[],
    public reward: number,
    public slots: number[],
    public supply: bigint,
  ) {
    this.id = id;
    this.over = over;
    this.claimed = claimed;
    this.level = level;
    this.slot_count = slot_count;
    this.slot_min = slot_min;
    this.slot_max = slot_max;
    this.number = number;
    this.next_number = next_number;
    this.selected_powers = selected_powers;
    this.selectable_powers = selectable_powers;
    this.available_powers = available_powers;
    this.reward = reward;
    this.slots = slots;
    this.supply = supply;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawGame): Game {
    return Game.parse(data);
  }

  static parse(data: RawGame) {
    const props = {
      id: Number(data.id.value),
      over: !!data.over.value,
      claimed: !!data.claimed.value,
      level: Number(data.level.value),
      slot_count: Number(data.slot_count.value),
      slot_min: Number(data.slot_min.value),
      slot_max: Number(data.slot_max.value),
      number: Number(data.number.value),
      next_number: Number(data.next_number.value),
      selected_powers: Power.getPowers(BigInt(data.selected_powers.value)),
      selectable_powers: Power.getPowers(BigInt(data.selectable_powers.value)),
      available_powers: Packer.sized_unpack(
        BigInt(data.available_powers.value),
        1n,
        4,
      ).map((index) => index !== 1),
      reward: Number(data.reward.value),
      slots: Packer.sized_unpack(BigInt(data.slots.value), SLOT_SIZE, 20),
      supply: BigInt(data.supply.value),
    };
    // Selected powers must be a 4 power array size, add None powers if needed
    props.selected_powers = props.selected_powers.concat(
      Array.from({ length: 4 - props.selected_powers.length }, () =>
        Power.from(0),
      ),
    );
    return new Game(
      props.id,
      props.over,
      props.claimed,
      props.level,
      props.slot_count,
      props.slot_min,
      props.slot_max,
      props.number,
      props.next_number,
      props.selected_powers,
      props.selectable_powers,
      props.available_powers,
      props.reward,
      props.slots,
      props.supply,
    );
  }

  static deduplicate(items: Game[]): Game[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }

  exists() {
    return this.slot_count !== 0;
  }

  hasStarted() {
    return this.number !== 0;
  }

  public static totalReward(level: number): number {
    return REWARDS.slice(0, level + 1).reduce((acc, curr) => acc + curr, 0);
  }

  /**
   * Calculate reward amount for a given level, matching the Cairo implementation in rewarder.cairo
   * @param level - The level of the reward (0-20)
   * @param slotCount - The number of slots in the game (default: 20)
   * @param supply - The current supply of the game
   * @param targetSupply - The target supply of the game
   * @returns The reward amount in wei (u64 equivalent)
   */
  public static calculateReward(
    level: number,
    slotCount: number,
    supply: bigint,
    targetSupply: bigint,
  ): number {
    // [Check] Manage the specific case where the supply is twice the target
    if (supply > targetSupply * 2n) {
      return 0;
    }

    // [Compute] Calculate the numerator based on supply vs target
    let num: bigint;
    if (supply < targetSupply) {
      // Supply is below target: increase reward
      const diff = targetSupply - supply;
      num = NUMERATOR + (NUMERATOR * diff) / targetSupply;
    } else {
      // Supply is above target: decrease reward
      const diff = supply - targetSupply;
      num = NUMERATOR - (NUMERATOR * diff) / targetSupply;
    }

    // Calculate denominator: (slot_count + 3)^5
    const slotCountBigInt = BigInt(slotCount);
    const denBase = slotCountBigInt + 3n;
    const den = denBase ** 5n;

    // Calculate level power: level^5
    const levelBigInt = BigInt(level);
    const levelPow = levelBigInt ** 5n;

    // Calculate reward: num / (den - level_pow) - (num - MIN_REWARD * den) / den
    const denominator = den - levelPow;
    if (denominator === 0n) {
      return 0; // Avoid division by zero
    }

    const firstTerm = num / denominator;
    const secondTerm = (num - MIN_REWARD * den) / den;
    const result = firstTerm - secondTerm;

    // Convert to number (u64 equivalent)
    return Number(result);
  }

  /**
   * Calculate rewards for all 20 levels (1-20) based on supply and target supply
   * @param slotCount - The number of slots in the game (default: 20)
   * @param supply - The current supply of the game
   * @param targetSupply - The target supply of the game
   * @returns Array of 20 reward values, one for each level
   */
  public static rewards(
    slotCount: number,
    supply: bigint,
    targetSupply: bigint,
  ): number[] {
    return Array.from({ length: 20 }, (_, index) => {
      const level = index + 1;
      return Game.calculateReward(level, slotCount, supply, targetSupply);
    });
  }

  alloweds(): number[] {
    // Return the indexes of the slots that are allowed to be set based on the number
    const [low, high] = this.closests();
    if (high === -1 && low === -1)
      return Array.from({ length: this.slots.length }, (_, idx) => idx);
    if (high === low) return [];
    if (low === -1) return Array.from({ length: high }, (_, idx) => idx);
    if (high === -1)
      return Array.from(
        { length: this.slots.length - low - 1 },
        (_, idx) => low + idx + 1,
      );
    return Array.from({ length: high - low - 1 }, (_, idx) => low + idx + 1);
  }

  closests(): number[] {
    // Return 2 indexes closest lower and higher to the number
    let closest_lower = -1;
    let closest_higher = -1;
    for (let idx = 0; idx < this.slots.length; idx++) {
      const slot = this.slots[idx];
      if (slot < this.number && slot !== 0) {
        closest_lower = idx;
      }
      if (slot > this.number && slot !== 0) {
        closest_higher = idx;
        break;
      }
    }
    return [closest_lower, closest_higher];
  }
}
