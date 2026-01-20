import type { RawStarterpack } from "@/models";

const MODEL_NAME = "Starterpack";

export class Starterpack {
  type = MODEL_NAME;

  constructor(
    public id: number,
    public reissuable: boolean,
    public referral_percentage: number,
    public price: bigint,
    public payment_token: string,
  ) {
    this.id = id;
    this.reissuable = reissuable;
    this.referral_percentage = referral_percentage;
    this.price = price;
    this.payment_token = payment_token;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawStarterpack): Starterpack {
    return Starterpack.parse(data);
  }

  static parse(data: RawStarterpack) {
    const props = {
      id: Number(data.id.value),
      reissuable: !!data.reissuable.value,
      referral_percentage: Number(data.referral_percentage.value),
      price: BigInt(data.price.value),
      payment_token: data.payment_token.value,
    };
    return new Starterpack(
      props.id,
      props.reissuable,
      props.referral_percentage,
      props.price,
      props.payment_token,
    );
  }

  static isType(model: Starterpack) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return BigInt(this.payment_token) !== 0n;
  }
}
