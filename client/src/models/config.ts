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
    // Use optional chaining for fields that may not exist on all deployments
    const props = {
      world_resource: data.world_resource?.value ?? "0x0",
      nums: data.nums?.value ?? "0x0",
      vrf: data.vrf?.value ?? "0x0",
      starterpack: data.starterpack?.value ?? "0x0",
      vault: data.vault?.value ?? "0x0",
      owner: data.owner?.value ?? "0x0",
      quote: data.quote?.value ?? "0x0",
      ekubo_router: data.ekubo_router?.value ?? "0x0",
      ekubo_positions: data.ekubo_positions?.value ?? "0x0",
      target_supply: BigInt(data.target_supply?.value ?? "0"),
      count: Number(data.count?.value ?? "0"),
      burn_percentage: Number(data.burn_percentage?.value ?? "0"),
      slot_count: Number(data.slot_count?.value ?? "0"),
      slot_min: Number(data.slot_min?.value ?? "0"),
      slot_max: Number(data.slot_max?.value ?? "0"),
      average_weigth: Number(data.average_weigth?.value ?? "0"),
      average_score: Number(data.average_score?.value ?? "0"),
      last_updated: BigInt(data.last_updated?.value ?? "0"),
      pool_fee: BigInt(data.pool_fee?.value ?? "0"),
      pool_tick_spacing: BigInt(data.pool_tick_spacing?.value ?? "0"),
      pool_extension: data.pool_extension?.value ?? "0x0",
      base_price: BigInt(data.base_price?.value ?? "0"),
      pool_sqrt: BigInt(data.pool_sqrt?.value ?? "0"),
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
