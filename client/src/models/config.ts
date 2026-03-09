import type { RawConfig } from "@/models";

const MODEL_NAME = "Config";

export class Config {
  type = MODEL_NAME;

  constructor(
    public world_resource: string,
    public nums: string,
    public vrf: string,
    public starterpack: string,
    public vault: string,
    public owner: string,
    public quote: string,
    public ekubo: string,
    public target_supply: bigint,
    public count: number,
    public burn_percentage: number,
    public slot_count: number,
    public slot_min: number,
    public slot_max: number,
    public average_weigth: number,
    public average_score: number,
    public last_updated: bigint,
    public pool_fee: bigint,
    public pool_tick_spacing: bigint,
    public pool_extension: string,
    public base_price: bigint,
  ) {
    this.world_resource = world_resource;
    this.nums = nums;
    this.vrf = vrf;
    this.starterpack = starterpack;
    this.vault = vault;
    this.owner = owner;
    this.quote = quote;
    this.ekubo = ekubo;
    this.target_supply = target_supply;
    this.count = count;
    this.burn_percentage = burn_percentage;
    this.slot_count = slot_count;
    this.slot_min = slot_min;
    this.slot_max = slot_max;
    this.average_weigth = average_weigth;
    this.average_score = average_score;
    this.last_updated = last_updated;
    this.pool_fee = pool_fee;
    this.pool_tick_spacing = pool_tick_spacing;
    this.pool_extension = pool_extension;
    this.base_price = base_price;
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
      vault: data.vault.value,
      owner: data.owner.value,
      quote: data.quote.value,
      ekubo: data.ekubo.value,
      target_supply: BigInt(data.target_supply.value),
      count: Number(data.count.value),
      burn_percentage: Number(data.burn_percentage.value),
      slot_count: Number(data.slot_count.value),
      slot_min: Number(data.slot_min.value),
      slot_max: Number(data.slot_max.value),
      average_weigth: Number(data.average_weigth.value),
      average_score: Number(data.average_score.value),
      last_updated: BigInt(data.last_updated.value),
      pool_fee: BigInt(data.pool_fee.value),
      pool_tick_spacing: BigInt(data.pool_tick_spacing.value),
      pool_extension: data.pool_extension.value,
      base_price: BigInt(data.base_price.value),
    };
    return new Config(
      props.world_resource,
      props.nums,
      props.vrf,
      props.starterpack,
      props.vault,
      props.owner,
      props.quote,
      props.ekubo,
      props.target_supply,
      props.count,
      props.burn_percentage,
      props.slot_count,
      props.slot_min,
      props.slot_max,
      props.average_weigth,
      props.average_score,
      props.last_updated,
      props.pool_fee,
      props.pool_tick_spacing,
      props.pool_extension,
      props.base_price,
    );
  }

  static isType(model: Config) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.owner !== "0x0";
  }
}
