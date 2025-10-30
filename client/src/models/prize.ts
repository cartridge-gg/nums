import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Prize";

// Payout ratios matching the Cairo contract
const PAYOUT_RATIOS = [1n, 3n, 6n, 12n, 24n, 48n, 96n, 192n, 384n, 768n];

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

  /**
   * Calculate the payout for a given rank and capacity.
   * @param amount - The total prize amount (in bigint or number for USD)
   * @param rank - The rank of the winner (1-based)
   * @param capacity - The maximum number of winners
   * @returns The payout amount for this rank
   */
  static payout(
    amount: bigint | number,
    rank: number,
    capacity: number,
  ): bigint | number {
    if (capacity === 0 || capacity > PAYOUT_RATIOS.length) {
      return 0;
    }

    // Handle both bigint and number types
    if (typeof amount === "bigint") {
      const [payout] = _payout(amount, rank, capacity, PAYOUT_RATIOS);
      return payout;
    }

    // For numbers (e.g., USD values), use number arithmetic
    const [payout] = _payoutNumber(
      amount,
      rank,
      capacity,
      PAYOUT_RATIOS.map((r) => Number(r)),
    );
    return payout;
  }
}

/**
 * Helper function to calculate the payout for a given rank and capacity (bigint version).
 * Returns a tuple of [payout, sum] where payout is the amount for this rank
 * and sum is the total of all payouts from this rank to the last.
 */
function _payout(
  prize: bigint,
  rank: number,
  capacity: number,
  ratios: readonly bigint[],
): [bigint, bigint] {
  if (rank === 0 || rank > capacity) {
    return [0n, 0n];
  }

  const ratio = ratios[rank - 1];

  if (rank === capacity) {
    const payout = prize / ratio;
    return [payout, payout];
  }

  const [, sum] = _payout(prize, rank + 1, capacity, ratios);
  const payout = (prize - sum) / ratio;
  return [payout, payout + sum];
}

/**
 * Helper function to calculate the payout for a given rank and capacity (number version).
 * Returns a tuple of [payout, sum] where payout is the amount for this rank
 * and sum is the total of all payouts from this rank to the last.
 */
function _payoutNumber(
  prize: number,
  rank: number,
  capacity: number,
  ratios: readonly number[],
): [number, number] {
  if (rank === 0 || rank > capacity) {
    return [0, 0];
  }

  const ratio = ratios[rank - 1];

  if (rank === capacity) {
    const payout = prize / ratio;
    return [payout, payout];
  }

  const [, sum] = _payoutNumber(prize, rank + 1, capacity, ratios);
  const payout = (prize - sum) / ratio;
  return [payout, payout + sum];
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
