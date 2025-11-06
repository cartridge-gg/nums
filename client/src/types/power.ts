import high from "@/assets/powers/boost-high.svg";
import highLocked from "@/assets/powers/boost-high-locked.svg";
import highUsed from "@/assets/powers/boost-high-used.svg";
import low from "@/assets/powers/boost-low.svg";
import lowLocked from "@/assets/powers/boost-low-locked.svg";
import lowUsed from "@/assets/powers/boost-low-used.svg";
import doubleUp from "@/assets/powers/double-up.svg";
import doubleUpLocked from "@/assets/powers/double-up-locked.svg";
import doubleUpUsed from "@/assets/powers/double-up-used.svg";
import foresight from "@/assets/powers/foresight.svg";
import foresightLocked from "@/assets/powers/foresight-locked.svg";
import foresightUsed from "@/assets/powers/foresight-used.svg";
import halve from "@/assets/powers/halve.svg";
import halveLocked from "@/assets/powers/halve-locked.svg";
import halveUsed from "@/assets/powers/halve-used.svg";
import mirror from "@/assets/powers/mirror.svg";
import mirrorLocked from "@/assets/powers/mirror-locked.svg";
import mirrorUsed from "@/assets/powers/mirror-used.svg";
import reroll from "@/assets/powers/reroll.svg";
import rerollLocked from "@/assets/powers/reroll-locked.svg";
import rerollUsed from "@/assets/powers/reroll-used.svg";
import { Packer } from "@/helpers/packer";

export const POWER_COUNT = 7;
export const DEFAULT_POWER_POINTS = 60;
export const POWER_COSTS = [5, 10, 15, 20, 25, 30, 35];

export enum PowerType {
  None = "None",
  Reroll = "Reroll",
  High = "High",
  Low = "Low",
  Foresight = "Foresight",
  DoubleUp = "Double Up",
  Halve = "Halve",
  Mirror = "Mirror",
}

export class Power {
  value: PowerType;

  constructor(value: PowerType) {
    this.value = value;
  }

  public into(): number {
    return Object.values(PowerType).indexOf(this.value);
  }

  public static from(index: number): Power {
    const item = Object.values(PowerType)[index];
    return new Power(item);
  }

  public static getAllPowers(): Power[] {
    return Object.values(PowerType)
      .slice(1)
      .map((value) => new Power(value));
  }

  public static toBitmap(powers: Power[]): bigint {
    return powers.reduce(
      (acc, power) => acc | (1n << BigInt(power.index())),
      0n,
    );
  }

  public static getPowers(bitmap: bigint): Power[] {
    // Extract indexes from bitmap for set bits
    const indexes = Packer.unpack(bitmap, 1n)
      .map((bit, index) => (bit === 1 ? index : undefined))
      .filter((index) => index !== undefined);
    return indexes.map((index) => Power.from(index + 1));
  }

  public getCost(board: bigint): number {
    return Power.getCosts(board)[this.index()].cost;
  }

  public static getCosts(board: bigint): { power: Power; cost: number }[] {
    const packs = Packer.sized_unpack(board, 32n, POWER_COUNT);
    // Count how many bits are set per pack, rank the indexes by the count
    const ranks = packs
      .map((pack, index) => {
        return {
          index,
          count: pack.toString(2).replace(/0/g, "").length,
        };
      })
      .sort((a, b) => a.count - b.count);
    const costs = ranks.map(({ index: powerIndex }, index) => {
      return {
        power: Power.from(powerIndex + 1),
        cost: POWER_COSTS[index],
      };
    });
    return costs;
  }

  public isNone(): boolean {
    return this.value === PowerType.None;
  }

  public condition(): number {
    switch (this.value) {
      case PowerType.Reroll:
        return 2;
      case PowerType.High:
        return 3;
      case PowerType.Low:
        return 3;
      case PowerType.Foresight:
        return 6;
      case PowerType.DoubleUp:
        return 5;
      case PowerType.Halve:
        return 4;
      case PowerType.Mirror:
        return 4;
      default:
        return 0;
    }
  }

  public isLocked(value: number): boolean {
    const condition = this.condition();
    return value < condition;
  }

  public index(): number {
    switch (this.value) {
      case PowerType.Reroll:
        return 0;
      case PowerType.High:
        return 1;
      case PowerType.Low:
        return 2;
      case PowerType.Foresight:
        return 3;
      case PowerType.DoubleUp:
        return 4;
      case PowerType.Halve:
        return 5;
      case PowerType.Mirror:
        return 6;
      default:
        return -1;
    }
  }

  public name(): string {
    switch (this.value) {
      case PowerType.Reroll:
        return "Reroll";
      case PowerType.High:
        return "Boost High";
      case PowerType.Low:
        return "Boost Low";
      case PowerType.Foresight:
        return "Foresight";
      case PowerType.DoubleUp:
        return "Double Up";
      case PowerType.Halve:
        return "Halve";
      case PowerType.Mirror:
        return "Mirror";
      default:
        return "";
    }
  }

  public description(): string {
    switch (this.value) {
      case PowerType.Reroll:
        return "Discard the current number and get a new one";
      case PowerType.High:
        return "Discard and get a number higher than the current number";
      case PowerType.Low:
        return "Discard and get a number lower than the current number";
      case PowerType.Foresight:
        return "Reveal the following number after this one";
      case PowerType.DoubleUp:
        return "Multiply the current number by two";
      case PowerType.Halve:
        return "Divide the current number by two";
      case PowerType.Mirror:
        return "Reflect the current number to it’s complementary value";
      default:
        return "";
    }
  }

  public icon(status?: "locked" | "used"): string {
    switch (this.value) {
      case PowerType.Reroll:
        return status === "locked"
          ? rerollLocked
          : status === "used"
            ? rerollUsed
            : reroll;
      case PowerType.High:
        return status === "locked"
          ? highLocked
          : status === "used"
            ? highUsed
            : high;
      case PowerType.Low:
        return status === "locked"
          ? lowLocked
          : status === "used"
            ? lowUsed
            : low;
      case PowerType.Foresight:
        return status === "locked"
          ? foresightLocked
          : status === "used"
            ? foresightUsed
            : foresight;
      case PowerType.DoubleUp:
        return status === "locked"
          ? doubleUpLocked
          : status === "used"
            ? doubleUpUsed
            : doubleUp;
      case PowerType.Halve:
        return status === "locked"
          ? halveLocked
          : status === "used"
            ? halveUsed
            : halve;
      case PowerType.Mirror:
        return status === "locked"
          ? mirrorLocked
          : status === "used"
            ? mirrorUsed
            : mirror;
      default:
        return "";
    }
  }
}
