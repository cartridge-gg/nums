import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Prize";

export type PrizeMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
};

export class PrizeModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public tournament_id: number,
    public address: string,
    public amount: bigint,
    public price?: string,
    public metadata?: PrizeMetadata,
    public formattedAmount?: string,
    public usdPrice?: string,
    public totalUsd?: string,
  ) {
    this.identifier = identifier;
    this.tournament_id = tournament_id;
    this.address = address;
    this.amount = amount;
    this.price = price;
    this.metadata = metadata;
    this.formattedAmount = formattedAmount;
    this.usdPrice = usdPrice;
    this.totalUsd = totalUsd;
  }

  static from(identifier: string, model: any) {
    if (!model) return PrizeModel.default(identifier);
    const tournament_id = Number(model.tournament_id);
    const address = model.address;
    const amount = BigInt(model.amount);
    return new PrizeModel(identifier, tournament_id, address, amount);
  }

  static default(identifier: string) {
    return new PrizeModel(identifier, 0, "0x0", 0n);
  }

  static isType(model: PrizeModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.amount !== 0n;
  }

  clone(): PrizeModel {
    return new PrizeModel(
      this.identifier,
      this.tournament_id,
      this.address,
      this.amount,
      this.price,
      this.metadata,
      this.formattedAmount,
      this.usdPrice,
      this.totalUsd,
    );
  }

  withMetadata(metadata: PrizeMetadata, formattedAmount: string): PrizeModel {
    return new PrizeModel(
      this.identifier,
      this.tournament_id,
      this.address,
      this.amount,
      this.price,
      metadata,
      formattedAmount,
      this.usdPrice,
      this.totalUsd,
    );
  }

  withUsdPrice(usdPrice: string | null, totalUsd: string | null): PrizeModel {
    return new PrizeModel(
      this.identifier,
      this.tournament_id,
      this.address,
      this.amount,
      this.price,
      this.metadata,
      this.formattedAmount,
      usdPrice || undefined,
      totalUsd || undefined,
    );
  }
}

export const Prize = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return PrizeModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
