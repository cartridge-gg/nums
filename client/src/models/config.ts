import type { RawConfig } from "@/models";

const MODEL_NAME = "Config";

export class Config {
  type = MODEL_NAME;

  constructor(
    public world_resource: string,
    public vrf: string,
    public starterpack: string,
    public quote: string,
    public ekubo_router: string,
    public ekubo_positions: string,
    public target_supply: bigint,
    public burn_percentage: number,
    public vault_percentage: number,
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
  ) {
    this.world_resource = world_resource;
    this.vrf = vrf;
    this.starterpack = starterpack;
    this.quote = quote;
    this.ekubo_router = ekubo_router;
    this.ekubo_positions = ekubo_positions;
    this.target_supply = target_supply;
    this.burn_percentage = burn_percentage;
    this.vault_percentage = vault_percentage;
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
    this.pool_sqrt = pool_sqrt;
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
      vrf: data.vrf.value,
      starterpack: data.starterpack.value,
      quote: data.quote.value,
      ekubo_router: data.ekubo_router.value,
      ekubo_positions: data.ekubo_positions.value,
      target_supply: BigInt(data.target_supply.value),
      burn_percentage: Number(data.burn_percentage.value),
      vault_percentage: Number(data.vault_percentage.value),
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
      props.vrf,
      props.starterpack,
      props.quote,
      props.ekubo_router,
      props.ekubo_positions,
      props.target_supply,
      props.burn_percentage,
      props.vault_percentage,
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
    return this.base_price !== 0n;
  }
}
