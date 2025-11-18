import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";
import { Packer } from "@/helpers/packer";
import { Power } from "@/types/power";

const MODEL_NAME = "Game";
const SLOT_SIZE = 12n;
export const REWARDS: number[] = [
  0, 1, 4, 10, 20, 35, 60, 100, 160, 225, 300, 600, 900, 1800, 2500, 4000, 6500,
  8000, 10000, 20000, 42000,
];

export class GameModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public over: boolean,
    public claimed: boolean,
    public level: number,
    public slot_count: number,
    public slot_min: number,
    public slot_max: number,
    public number: number,
    public next_number: number,
    public tournament_id: number,
    public selected_powers: Power[],
    public available_powers: Power[],
    public reward: number,
    public score: number,
    public slots: number[],
  ) {
    this.identifier = identifier;
    this.id = id;
    this.over = over;
    this.claimed = claimed;
    this.level = level;
    this.slot_count = slot_count;
    this.slot_min = slot_min;
    this.slot_max = slot_max;
    this.number = number;
    this.next_number = next_number;
    this.tournament_id = tournament_id;
    this.selected_powers = selected_powers;
    this.available_powers = available_powers;
    this.reward = reward;
    this.score = score;
    this.slots = slots;
  }

  static from(identifier: string, model: any) {
    if (!model) return GameModel.default(identifier);
    const id = Number(model.id);
    const over = !!model.over;
    const claimed = !!model.claimed;
    const level = Number(model.level);
    const slot_count = Number(model.slot_count);
    const slot_min = Number(model.slot_min);
    const slot_max = Number(model.slot_max);
    const number = Number(model.number);
    const next_number = Number(model.next_number);
    const tournament_id = Number(model.tournament_id);
    const selected_powers = Power.getPowers(BigInt(model.selected_powers));
    const available_powers = Power.getPowers(BigInt(model.available_powers));
    const reward = Number(model.reward);
    const score = Number(model.score);
    const slots = Packer.sized_unpack(BigInt(model.slots), SLOT_SIZE, 20);
    return new GameModel(
      identifier,
      id,
      over,
      claimed,
      level,
      slot_count,
      slot_min,
      slot_max,
      number,
      next_number,
      tournament_id,
      selected_powers,
      available_powers,
      reward,
      score,
      slots,
    );
  }

  static default(identifier: string) {
    return new GameModel(
      identifier,
      0,
      false,
      false,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      [],
      [],
      0,
      0,
      [],
    );
  }

  static isType(model: GameModel) {
    return model.type === MODEL_NAME;
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

  adjacent(): number {
    let count = 0;
    let previous_filled = false;
    let previous_accounted = false;
    for (const slot of this.slots) {
      if (slot === 0) {
        previous_filled = false;
        previous_accounted = false;
        continue;
      }
      if (!previous_filled) {
        previous_filled = true;
        previous_accounted = false;
        continue;
      }
      if (!previous_accounted) {
        count += 2;
        previous_accounted = true;
        continue;
      }
      count += 1;
    }
    return count;
  }

  clone(): GameModel {
    return new GameModel(
      this.identifier,
      this.id,
      this.over,
      this.claimed,
      this.level,
      this.slot_count,
      this.slot_min,
      this.slot_max,
      this.number,
      this.next_number,
      this.tournament_id,
      this.selected_powers,
      this.available_powers,
      this.reward,
      this.score,
      [...this.slots],
    );
  }
}

export const Game = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return GameModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
