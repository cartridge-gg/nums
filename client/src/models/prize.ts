import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Prize";

// Constants matching the Cairo contract
const PRECISION = 10_000;
const PAYOUTS: number[][] = [
  [10_000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [7000, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [5000, 3000, 2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4000, 2500, 2000, 1500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3700, 2500, 1500, 1200, 1100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3500, 2200, 1500, 1100, 900, 800, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3100, 2100, 1300, 1000, 850, 650, 550, 450, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3000, 2000, 1200, 950, 800, 600, 500, 400, 300, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2800, 1700, 1060, 860, 760, 530, 430, 330, 270, 210, 210, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2700, 1600, 1000, 800, 700, 490, 390, 290, 240, 190, 190, 130, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2650, 1550, 980, 780, 680, 460, 360, 280, 220, 165, 165, 110, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2600, 1500, 960, 760, 660, 450, 350, 260, 210, 150, 150, 100, 90, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2550, 1475, 940, 740, 640, 440, 340, 240, 195, 140, 140, 95, 85, 75, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2500, 1450, 920, 720, 620, 430, 330, 230, 185, 140, 140, 90, 80, 70, 60, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2450, 1425, 900, 700, 600, 420, 320, 220, 165, 125, 125, 85, 75, 65, 55, 50, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2400, 1400, 880, 680, 580, 410, 310, 210, 150, 110, 110, 85, 75, 65, 55, 50, 37, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2350, 1375, 880, 680, 580, 410, 310, 210, 150, 110, 110, 75, 65, 55, 50, 45, 30, 27, 25, 0, 0, 0, 0, 0, 0, 0, 0],
  [2300, 1350, 850, 650, 550, 390, 290, 190, 130, 100, 100, 70, 60, 50, 45, 40, 28, 24, 22, 21, 0, 0, 0, 0, 0, 0, 0],
  [2250, 1325, 850, 650, 550, 390, 290, 190, 130, 100, 100, 70, 60, 50, 45, 40, 24, 20, 19, 15, 14, 0, 0, 0, 0, 0, 0],
  [2200, 1300, 830, 630, 530, 380, 280, 180, 125, 95, 95, 65, 55, 45, 40, 35, 24, 20, 19, 15, 14, 13, 0, 0, 0, 0, 0],
  [2175, 1275, 830, 630, 530, 380, 280, 180, 125, 95, 95, 55, 45, 40, 35, 30, 24, 20, 19, 15, 13, 12, 11, 0, 0, 0, 0],
  [2150, 1250, 810, 610, 510, 370, 270, 170, 115, 85, 85, 55, 45, 40, 35, 30, 20, 19, 18, 15, 13, 12, 11, 11, 0, 0, 0],
  [2100, 1225, 810, 610, 510, 370, 270, 170, 115, 85, 85, 55, 45, 40, 35, 30, 20, 19, 18, 13, 12, 11, 10, 10, 9, 0, 0],
  [2075, 1200, 790, 590, 490, 360, 260, 160, 90, 75, 75, 55, 45, 40, 35, 30, 20, 19, 18, 13, 12, 11, 10, 10, 9, 9, 0],
  [2050, 1175, 790, 590, 490, 360, 260, 160, 90, 75, 75, 50, 40, 35, 30, 25, 20, 18, 17, 13, 12, 11, 10, 10, 9, 9, 8],
];

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
   * Calculate the payout for a given rank and entry count.
   * @param amount - The total prize amount (in bigint or number for USD)
   * @param rank - The rank of the winner (1-based)
   * @param entryCount - The number of entries in the tournament
   * @returns The payout amount for this rank
   */
  static payout(
    amount: bigint | number,
    rank: number,
    entryCount: number,
  ): bigint | number {
    const row = _row(entryCount, PAYOUTS.length - 1);
    const payouts = PAYOUTS[row];
    const col = _column(rank, payouts.length - 1);
    const ratio = col < payouts.length ? payouts[col] : 0;

    // Handle both bigint and number types
    if (typeof amount === "bigint") {
      return (amount * BigInt(ratio)) / BigInt(PRECISION);
    }

    return (amount * ratio) / PRECISION;
  }
}

/**
 * Determine which row of the PAYOUTS matrix to use based on entry count.
 * Matches the Cairo contract _row function.
 */
function _row(entryCount: number, max: number): number {
  if (entryCount === 0) {
    return max;
  } else if (entryCount < 11) {
    return Math.floor((7 + entryCount) / 10);
  } else if (entryCount < 31) {
    return 2;
  } else if (entryCount < 61) {
    return Math.floor((entryCount - 1) / 10);
  } else if (entryCount < 76) {
    return 2 + Math.floor((entryCount - 1) / 15);
  } else if (entryCount < 101) {
    return 4 + Math.floor((entryCount - 1) / 25);
  } else if (entryCount < 401) {
    return 6 + Math.floor((entryCount - 1) / 50);
  } else if (entryCount < 501) {
    return 10 + Math.floor((entryCount - 1) / 100);
  } else if (entryCount < 701) {
    return 15;
  } else if (entryCount < 801) {
    return 16;
  } else if (entryCount < 1001) {
    return 13 + Math.floor((entryCount - 1) / 200);
  } else if (entryCount < 2501) {
    return 14 + Math.floor((entryCount - 1) / 250);
  }
  return max;
}

/**
 * Determine which column of the PAYOUTS matrix to use based on rank.
 * Matches the Cairo contract _column function.
 */
function _column(rank: number, max: number): number {
  if (rank === 0) {
    return max;
  } else if (rank < 11) {
    return rank - 1;
  } else if (rank < 41) {
    return 8 + Math.floor((rank - 1) / 5);
  } else if (rank < 61) {
    return 12 + Math.floor((rank - 1) / 10);
  } else if (rank < 76) {
    return 14 + Math.floor((rank - 1) / 15);
  }
  return 16 + Math.floor((rank - 1) / 25);
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
