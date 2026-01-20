import type { RawConfig } from "@/models";

const MODEL_NAME = "Config";

export class Config {
  type = MODEL_NAME;

  constructor(
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

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawConfig): Config {
    return Config.parse(data);
  }

  static parse(data: RawConfig) {
    const props = {
      world_resource: data.world_resource.value,
      nums: data.nums.value,
      vrf: data.vrf.value,
      starterpack: data.starterpack.value,
      owner: data.owner.value,
      entry_price: BigInt(data.entry_price.value),
      target_supply: BigInt(data.target_supply.value),
      count: Number(data.count.value),
      slot_count: Number(data.slot_count.value),
      slot_min: Number(data.slot_min.value),
      slot_max: Number(data.slot_max.value),
    };
    return new Config(
      props.world_resource,
      props.nums,
      props.vrf,
      props.starterpack,
      props.owner,
      props.entry_price,
      props.target_supply,
      props.count,
      props.slot_count,
      props.slot_min,
      props.slot_max,
    );
  }

  static isType(model: Config) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.owner !== "0x0";
  }
}
