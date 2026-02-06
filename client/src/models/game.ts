import { Packer } from "@/helpers/packer";
import { Power } from "@/types/power";
import type { RawGame } from "@/models";
import { Trap } from "@/types/trap";

const MODEL_NAME = "Game";
const SLOT_SIZE = 12n;

// Constants matching rewarder.cairo
const NUMERATOR = 270_000_000_000n;
const MIN_REWARD = 1n;

export class Game {
  type = MODEL_NAME;

  constructor(
    public id: number,
    public claimed: boolean,
    public multiplier: number,
    public level: number,
    public slot_count: number,
    public slot_min: number,
    public slot_max: number,
    public number: number,
    public next_number: number,
    public selectable_powers: Power[],
    public selected_powers: Power[],
    public available_powers: boolean[],
    public disabled_traps: boolean[],
    public reward: number,
    public over: number,
    public expiration: number,
    public traps: Trap[],
    public slots: number[],
    public supply: bigint,
  ) {
    this.id = id;
    this.claimed = claimed;
    this.level = level;
    this.slot_count = slot_count;
    this.slot_min = slot_min;
    this.slot_max = slot_max;
    this.number = number;
    this.next_number = next_number;
    this.selectable_powers = selectable_powers;
    this.selected_powers = selected_powers;
    this.available_powers = available_powers;
    this.disabled_traps = disabled_traps;
    this.reward = reward;
    this.over = over;
    this.traps = traps;
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
      claimed: !!data.claimed.value,
      multiplier: Number(data.multiplier.value),
      level: Number(data.level.value),
      slot_count: Number(data.slot_count.value),
      slot_min: Number(data.slot_min.value),
      slot_max: Number(data.slot_max.value),
      number: Number(data.number.value),
      next_number: Number(data.next_number.value),
      selectable_powers: Power.getPowers(BigInt(data.selectable_powers.value)),
      selected_powers: Power.getPowers(BigInt(data.selected_powers.value)),
      available_powers: Packer.sized_unpack(
        BigInt(data.available_powers.value),
        1n,
        3,
      ).map((index) => index !== 1),
      disabled_traps: Packer.sized_unpack(
        BigInt(data.disabled_traps.value),
        1n,
        Number(data.slot_count.value),
      ).map((index) => index === 1),
      reward: Number(data.reward.value),
      over: Number(data.over.value),
      expiration: Number(data.expiration.value),
      traps: Trap.getTraps(BigInt(data.traps.value)),
      slots: Packer.sized_unpack(
        BigInt(data.slots.value),
        SLOT_SIZE,
        Number(data.slot_count.value),
      ),
      supply: BigInt(data.supply.value),
    };
    // Selected powers must be a 4 power array size, add None powers if needed
    props.selected_powers = props.selected_powers.concat(
      Array.from({ length: 3 - props.selected_powers.length }, () =>
        Power.from(0),
      ),
    );
    return new Game(
      props.id,
      props.claimed,
      props.multiplier,
      props.level,
      props.slot_count,
      props.slot_min,
      props.slot_max,
      props.number,
      props.next_number,
      props.selectable_powers,
      props.selected_powers,
      props.available_powers,
      props.disabled_traps,
      props.reward,
      props.over,
      props.expiration,
      props.traps,
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

  getTrap(index: number): Trap | undefined {
    const trap = this.traps[index];
    if (trap.isNone()) {
      return undefined;
    }
    return trap;
  }

  isInactive(index: number): boolean {
    return this.disabled_traps[index];
  }

  /**
   * Calculate reward amount for a given level, matching the Cairo implementation in rewarder.cairo
   * @param level - The level of the reward (0-18)
   * @param slotCount - The number of slots in the game (default: 18)
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
   * Calculate rewards for all levels based on supply and target supply
   * @param slotCount - The number of slots in the game (default: 18)
   * @param supply - The current supply of the game
   * @param targetSupply - The target supply of the game
   * @returns Array of slot-count reward values, one for each level
   */
  public static rewards(
    slotCount: number,
    supply: bigint,
    targetSupply: bigint,
  ): number[] {
    return Array.from({ length: slotCount }, (_, index) => {
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

  equal(other: Game | undefined): boolean {
    if (!other) return false;
    if (this.id !== other.id) return false;

    // Compare basic properties
    if (this.claimed !== other.claimed) return false;
    if (this.multiplier !== other.multiplier) return false;
    if (this.level !== other.level) return false;
    if (this.slot_count !== other.slot_count) return false;
    if (this.slot_min !== other.slot_min) return false;
    if (this.slot_max !== other.slot_max) return false;
    if (this.number !== other.number) return false;
    if (this.next_number !== other.next_number) return false;
    if (this.reward !== other.reward) return false;
    if (this.over !== other.over) return false;
    if (this.expiration !== other.expiration) return false;
    if (this.supply !== other.supply) return false;

    // Compare slots
    if (
      this.slots.length !== other.slots.length ||
      !this.slots.every((val, idx) => val === other.slots[idx])
    ) {
      return false;
    }

    // Compare selectable_powers
    if (
      this.selectable_powers.length !== other.selectable_powers.length ||
      !this.selectable_powers.every(
        (p, idx) => p.toString() === other.selectable_powers[idx].toString(),
      )
    ) {
      return false;
    }

    // Compare selected_powers
    if (
      this.selected_powers.length !== other.selected_powers.length ||
      !this.selected_powers.every(
        (p, idx) => p.toString() === other.selected_powers[idx].toString(),
      )
    ) {
      return false;
    }

    // Compare available_powers
    if (
      this.available_powers.length !== other.available_powers.length ||
      !this.available_powers.every(
        (p, idx) => p === other.available_powers[idx],
      )
    ) {
      return false;
    }

    // Compare disabled_traps
    if (
      this.disabled_traps.length !== other.disabled_traps.length ||
      !this.disabled_traps.every((t, idx) => t === other.disabled_traps[idx])
    ) {
      return false;
    }

    // Compare traps
    if (
      this.traps.length !== other.traps.length ||
      !this.traps.every(
        (t, idx) => t.toString() === other.traps[idx].toString(),
      )
    ) {
      return false;
    }

    return true;
  }
}
