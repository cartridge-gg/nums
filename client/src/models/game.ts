import { Packer } from "@/helpers/packer";
import { Power } from "@/types/power";
import type { RawGame } from "@/models";
import { Trap } from "@/types/trap";
import { Verifier } from "@/helpers/verifier";
import { Random } from "@/helpers/random";
import { Rewarder } from "@/helpers/rewarder";
import {
  DEFAULT_DRAW_COUNT,
  DEFAULT_DRAW_STAGE,
  DEFAULT_MAX_DRAW,
  DEFAULT_EXPIRATION,
  BASE_MULTIPLIER,
  DEFAULT_POWER_COUNT,
} from "@/constants";
import { TRAP_COUNT } from "@/types/trap";

const MODEL_NAME = "Game";
const SLOT_SIZE = 12n;

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
    public enabled_powers: boolean[],
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
    this.enabled_powers = enabled_powers;
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
      enabled_powers: Packer.sized_unpack(
        BigInt(data.enabled_powers.value),
        1n,
        DEFAULT_POWER_COUNT,
      ).map((index) => index === 1),
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
      props.enabled_powers,
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
      return Rewarder.amount(level, slotCount, supply, targetSupply);
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

    // Compare enabled_powers
    if (
      this.enabled_powers.length !== other.enabled_powers.length ||
      !this.enabled_powers.every((p, idx) => p === other.enabled_powers[idx])
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

  /**
   * Clone the game instance
   * Creates a new Game instance with the same values
   * This ensures React detects state changes
   */
  clone(): Game {
    return new Game(
      this.id,
      this.claimed,
      this.multiplier,
      this.level,
      this.slot_count,
      this.slot_min,
      this.slot_max,
      this.number,
      this.next_number,
      [...this.selectable_powers],
      [...this.selected_powers],
      [...this.enabled_powers],
      [...this.disabled_traps],
      this.reward,
      this.over,
      this.expiration,
      [...this.traps],
      [...this.slots],
      this.supply,
    );
  }

  /**
   * Start the game
   * Equivalent to GameTrait::start in models/game.cairo
   */
  start(rand: Random): void {
    // [Check] Game has not started yet
    if (this.number !== 0) {
      throw new Error("Game: already started");
    }
    // [Effect] Draw numbers
    const slots = [...this.slots];
    this.number = this.next(slots, rand);
    slots.push(this.number);
    this.next_number = this.next(slots, rand);
    // [Effect] Draw traps
    const traps = Trap.generate(TRAP_COUNT, this.slot_count, rand);
    this.traps = traps.map((trapIndex) => Trap.from(trapIndex));
    // [Effect] Set expiration
    // For practice mode, we use a mock timestamp
    const mockTimestamp = Math.floor(Date.now() / 1000);
    this.expiration = mockTimestamp + DEFAULT_EXPIRATION;
  }

  /**
   * Validates that the slots array is in valid order
   * Equivalent to GameTrait::is_valid in models/game.cairo
   */
  isValid(): boolean {
    return Verifier.isValid(this.slots);
  }

  /**
   * Returns the largest streak of consecutive numbers
   * Equivalent to GameTrait::streak in models/game.cairo
   */
  static streak(slots: number[]): number {
    return Verifier.streak(slots);
  }

  /**
   * Check if the game is completed
   * Equivalent to GameTrait::is_completed in models/game.cairo
   */
  isCompleted(): boolean {
    return this.level === this.slot_count;
  }

  /**
   * Determines if the game has ended
   * Equivalent to GameTrait::is_over in models/game.cairo
   */
  isOver(): boolean {
    return (
      Verifier.isOver(this.number, this.level, this.slot_count, this.slots) &&
      this.selectable_powers.length === 0 &&
      this.enabled_powers.every((enabled) => !enabled)
    );
  }

  /**
   * Determines if the game has expired
   * Equivalent to GameTrait::is_expired in models/game.cairo
   */
  isExpired(): boolean {
    // For practice mode, we use a mock timestamp
    const mockTimestamp = Math.floor(Date.now() / 1000);
    return mockTimestamp >= this.expiration;
  }

  /**
   * Generates a random number between min and max that is not already present in slots
   * Equivalent to GameTrait::next in models/game.cairo
   */
  next(slots: number[], rand: Random): number {
    return rand.nextUnique(this.slot_min, this.slot_max, slots);
  }

  /**
   * Rewards the game for the current level
   * Equivalent to GameTrait::reward in models/game.cairo
   */
  addReward(supply: bigint, target: bigint): void {
    const rewardAmount = Rewarder.amount(
      this.level,
      this.slot_count,
      supply,
      target,
    );
    this.reward += rewardAmount;
  }

  /**
   * Levels up the game
   * Equivalent to GameTrait::level_up in models/game.cairo
   */
  levelUp(): void {
    this.level += 1;
  }

  /**
   * Check if powers can be drawn
   * Equivalent to GameTrait::is_drawable in models/game.cairo
   */
  isDrawable(): boolean {
    return (
      this.selectable_powers.length === 0 &&
      !this.isCompleted() &&
      this.level % DEFAULT_DRAW_STAGE === 0 &&
      this.level < DEFAULT_MAX_DRAW
    );
  }

  /**
   * Place a number in a slot
   * Equivalent to GameTrait::place in models/game.cairo
   */
  place(number: number, index: number, rand: Random): void {
    // [Check] Index is valid
    if (index < 0 || index >= this.slot_count) {
      throw new Error("Game: index not valid");
    }
    // [Check] Target slot is empty
    if (this.slots[index] !== 0) {
      throw new Error("Game: slot not empty");
    }
    // [Effect] Place number
    this.set(index, number);
    // [Effect] Trigger trap if available, disable it before to avoid infinite loops
    const trap = this.traps[index];
    if (!this.disabled_traps[index] && trap !== undefined && !trap.isNone()) {
      this.disabled_traps[index] = true;
      trap.apply(this, index, rand);
    }
  }

  /**
   * Set a slot value
   * Equivalent to GameTrait::set in models/game.cairo
   */
  private set(index: number, number: number): void {
    this.slots[index] = number;
  }

  /**
   * Unset a slot value
   * Equivalent to GameTrait::unset in models/game.cairo
   */
  private unset(index: number): void {
    this.set(index, 0);
  }

  /**
   * Shuffle a slot
   * Equivalent to GameTrait::shuffle in models/game.cairo
   */
  shuffle(index: number, rand: Random): void {
    // [Effect] Take the nearest number and shuffle them
    const slots = this.slots;
    // [Compute] Find the nearest number to the left
    let previous = this.slot_min;
    for (let idx = index - 1; idx >= 0; idx--) {
      const slot = slots[idx];
      if (slot !== 0) {
        previous = slot;
        break;
      }
    }
    // [Compute] Find the nearest number to the right
    let next = this.slot_max;
    for (let idx = index + 1; idx < slots.length; idx++) {
      const slot = slots[idx];
      if (slot !== 0) {
        next = slot;
        break;
      }
    }
    // [Effect] Shuffle the slot at index
    const slot = rand.between(previous, next);
    this.set(index, slot);
  }

  /**
   * Move a slot from one index to another
   * Equivalent to GameTrait::move in models/game.cairo
   */
  move(from: number, to: number, rand: Random): void {
    // [Check] Index is valid
    if (
      from < 0 ||
      from >= this.slot_count ||
      to < 0 ||
      to >= this.slot_count
    ) {
      throw new Error("Game: index not valid");
    }
    // [Effect] Move number
    const slot = this.slots[from];
    this.unset(from);
    this.place(slot, to, rand);
  }

  /**
   * Force slots array
   * Equivalent to GameTrait::force in models/game.cairo
   */
  force(slots: number[]): void {
    if (slots.length !== this.slot_count) {
      throw new Error("Game: slots pack failed");
    }
    this.slots = [...slots];
  }

  /**
   * Select a selectable power
   * Equivalent to GameTrait::select in models/game.cairo
   */
  select(index: number): void {
    // [Check] Power is selectable
    if (this.selectable_powers.length === 0 || index >= DEFAULT_DRAW_COUNT) {
      throw new Error("Game: invalid power selection");
    }
    // [Effect] Select power and add to selected powers
    const power = this.selectable_powers[index];
    this.selected_powers.push(power);
    // Ensure enabled_powers has enough elements (same length as selected_powers)
    // true = available/enabled, false = used
    while (this.enabled_powers.length < this.selected_powers.length) {
      this.enabled_powers.push(true);
    }
    // [Effect] Erase selectable powers
    this.selectable_powers = [];
    // [Effect] Update power availability
    const powerIndex = this.level / DEFAULT_DRAW_STAGE - 1;
    this.enabled_powers = this.enabled_powers.map((enabled, index) =>
      index === powerIndex ? true : enabled,
    );
    // [Effect] Update game over
    if (this.isOver()) {
      // For practice mode, we use a mock timestamp
      const mockTimestamp = Math.floor(Date.now() / 1000);
      this.over = mockTimestamp;
    }
  }

  /**
   * Apply a power to the game
   * Equivalent to GameTrait::apply in models/game.cairo
   */
  applyPower(index: number, _rand: Random): void {
    // [Check] Power is not selectable
    if (this.selectable_powers.length !== 0) {
      throw new Error("Game: power must be selected");
    }
    // [Check] Power is valid
    if (index >= this.selected_powers.length) {
      throw new Error("Game: power not available");
    }
    const power = this.selected_powers[index];
    if (!power || power.isNone()) {
      throw new Error("Game: power not available");
    }
    // Ensure enabled_powers has enough elements (same length as selected_powers)
    while (this.enabled_powers.length < this.selected_powers.length) {
      this.enabled_powers.push(true); // true = available/enabled, false = used
    }
    // Check if power is already used (enabled_powers[index] === false means used)
    if (!this.enabled_powers[index]) {
      throw new Error("Game: power not available");
    }
    // [Effect] Update power availability (mark as used)
    this.enabled_powers[index] = false;
    // [Effect] Apply power
    power.apply(this, _rand);
    // [Effect] Update game over
    if (this.isOver()) {
      // For practice mode, we use a mock timestamp
      const mockTimestamp = Math.floor(Date.now() / 1000);
      this.over = mockTimestamp;
    }
  }

  /**
   * Update the game state
   * Equivalent to GameTrait::update in models/game.cairo
   */
  update(rand: Random, target: bigint): void {
    // [Check] Power is not selectable
    if (this.selectable_powers.length !== 0) {
      throw new Error("Game: power must be selected");
    }
    // [Effect] Level up
    this.levelUp();
    // [Effect] Update Reward
    this.addReward(this.supply, target);
    // [Effect] Update numbers if the game is not completed
    if (!this.isCompleted()) {
      // [Info] Artificially add the number to the slots to avoid pulling the same number
      const cloneSlots = [...this.slots];
      this.number = this.next_number;
      cloneSlots.push(this.number);
      this.next_number = this.next(cloneSlots, rand);
    }
    // [Effect] Draw new powers if possible
    if (this.isDrawable()) {
      const powerIndexes = Power.draw(rand.nextSeed(), DEFAULT_DRAW_COUNT);
      this.selectable_powers = powerIndexes.map((index) => Power.from(index));
    }
    // [Effect] Assess game over
    // [Info] Game is over if:
    // - number cannot be placed
    // - powers cannot save the game
    // - no powers can be selected
    if (this.isOver()) {
      // For practice mode, we use a mock timestamp
      const mockTimestamp = Math.floor(Date.now() / 1000);
      this.over = mockTimestamp;
    }
  }

  /**
   * Claim the game
   * Equivalent to GameTrait::claim in models/game.cairo
   */
  claim(): number {
    // [Effect] Claim game
    this.claimed = true;
    return Math.floor((this.reward * this.multiplier) / BASE_MULTIPLIER);
  }
}
