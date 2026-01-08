import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Config";

export class ConfigModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public world_resource: string,
    public nums: string,
    public vrf: string,
    public starterpack: string,
    public owner: string,
    public entry_price: bigint,
    public target_supply: bigint,
    public count: number,
    public slot_count: number,
    public slot_min: number,
    public slot_max: number,
  ) {
    this.identifier = identifier;
    this.world_resource = world_resource;
    this.nums = nums;
    this.vrf = vrf;
    this.starterpack = starterpack;
    this.owner = owner;
    this.entry_price = entry_price;
    this.target_supply = target_supply;
    this.count = count;
    this.slot_count = slot_count;
    this.slot_min = slot_min;
    this.slot_max = slot_max;
  }

  static from(identifier: string, model: any) {
    if (!model) return ConfigModel.default(identifier);
    const world_resource = model.world_resource;
    const nums = model.nums;
    const vrf = model.vrf;
    const starterpack = model.starterpack;
    const owner = model.owner;
    const entry_price = BigInt(model.entry_price);
    const target_supply = BigInt(model.target_supply);
    const count = Number(model.count);
    const slot_count = Number(model.slot_count);
    const slot_min = Number(model.slot_min);
    const slot_max = Number(model.slot_max);
    return new ConfigModel(
      identifier,
      world_resource,
      nums,
      vrf,
      starterpack,
      owner,
      entry_price,
      target_supply,
      count,
      slot_count,
      slot_min,
      slot_max,
    );
  }

  static default(identifier: string) {
    return new ConfigModel(
      identifier,
      "0x0",
      "0x0",
      "0x0",
      "0x0",
      "0x0",
      0n,
      0n,
      0,
      0,
      0,
      0,
    );
  }

  static isType(model: ConfigModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.owner !== "0x0";
  }

  clone(): ConfigModel {
    return new ConfigModel(
      this.identifier,
      this.world_resource,
      this.nums,
      this.vrf,
      this.starterpack,
      this.owner,
      this.entry_price,
      this.target_supply,
      this.count,
      this.slot_count,
      this.slot_min,
      this.slot_max,
    );
  }
}

export const Config = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return ConfigModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
