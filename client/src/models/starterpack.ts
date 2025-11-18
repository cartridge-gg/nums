import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Starterpack";

export class StarterpackModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public reissuable: boolean,
    public referral_percentage: number,
    public price: bigint,
    public payment_token: string,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.reissuable = reissuable;
    this.referral_percentage = referral_percentage;
    this.price = price;
    this.payment_token = payment_token;
  }

  static from(identifier: string, model: any) {
    if (!model) return StarterpackModel.default(identifier);
    const id = Number(model.id);
    const reissuable = model.reissuable;
    const referral_percentage = Number(model.referral_percentage);
    const price = BigInt(model.price);
    const payment_token = model.payment_token;
    return new StarterpackModel(
      identifier,
      id,
      reissuable,
      referral_percentage,
      price,
      payment_token,
    );
  }

  static default(identifier: string) {
    return new StarterpackModel(identifier, 0, false, 0, 0n, "0x0");
  }

  static isType(model: StarterpackModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return BigInt(this.payment_token) !== 0n;
  }

  clone(): StarterpackModel {
    return new StarterpackModel(
      this.identifier,
      this.id,
      this.reissuable,
      this.referral_percentage,
      this.price,
      this.payment_token,
    );
  }
}

export const Starterpack = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return StarterpackModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
