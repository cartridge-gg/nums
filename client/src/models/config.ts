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
    public ekubo_router: string,
    public ekubo_positions: string,
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
    public pool_sqrt: bigint,
  ) {}

  /** Alias for base_price, used by mobile code */
  get entry_price(): bigint {
    return this.base_price;
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
      ekubo_router: data.ekubo_router.value,
      ekubo_positions: data.ekubo_positions.value,
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
      pool_sqrt: BigInt(data.pool_sqrt.value),
    };
    return new Config(
      props.world_resource,
      props.nums,
      props.vrf,
      props.starterpack,
      props.vault,
      props.owner,
      props.quote,
      props.ekubo_router,
      props.ekubo_positions,
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
      props.pool_sqrt,
    );
  }

  static isType(model: Config) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.owner !== "0x0";
  }
}
