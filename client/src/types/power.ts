import type { ComponentType } from "react";
import { BoostHighIcon } from "@/components/icons/powers/boost-high-icon";
import { BoostHighLockedIcon } from "@/components/icons/powers/boost-high-locked-icon";
import { BoostHighUsedIcon } from "@/components/icons/powers/boost-high-used-icon";
import { BoostLowIcon } from "@/components/icons/powers/boost-low-icon";
import { BoostLowLockedIcon } from "@/components/icons/powers/boost-low-locked-icon";
import { BoostLowUsedIcon } from "@/components/icons/powers/boost-low-used-icon";
import { DoubleUpIcon } from "@/components/icons/powers/double-up-icon";
import { DoubleUpLockedIcon } from "@/components/icons/powers/double-up-locked-icon";
import { DoubleUpUsedIcon } from "@/components/icons/powers/double-up-used-icon";
import { ForesightIcon } from "@/components/icons/powers/foresight-icon";
import { ForesightLockedIcon } from "@/components/icons/powers/foresight-locked-icon";
import { ForesightUsedIcon } from "@/components/icons/powers/foresight-used-icon";
import { HalveIcon } from "@/components/icons/powers/halve-icon";
import { HalveLockedIcon } from "@/components/icons/powers/halve-locked-icon";
import { HalveUsedIcon } from "@/components/icons/powers/halve-used-icon";
import { MirrorIcon } from "@/components/icons/powers/mirror-icon";
import { MirrorLockedIcon } from "@/components/icons/powers/mirror-locked-icon";
import { MirrorUsedIcon } from "@/components/icons/powers/mirror-used-icon";
import { RerollIcon } from "@/components/icons/powers/reroll-icon";
import { RerollLockedIcon } from "@/components/icons/powers/reroll-locked-icon";
import { RerollUsedIcon } from "@/components/icons/powers/reroll-used-icon";
import type { IconProps } from "@/components/icons/types";
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

type PowerIconStatus = "locked" | "used";
type PowerIconComponent = ComponentType<IconProps>;

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
        return "Discard and get a number higher than the current one";
      case PowerType.Low:
        return "Discard and get a number lower than the current one";
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

  public icon(status?: PowerIconStatus): PowerIconComponent {
    switch (this.value) {
      case PowerType.Reroll:
        return status === "locked"
          ? RerollLockedIcon
          : status === "used"
            ? RerollUsedIcon
            : RerollIcon;
      case PowerType.High:
        return status === "locked"
          ? BoostHighLockedIcon
          : status === "used"
            ? BoostHighUsedIcon
            : BoostHighIcon;
      case PowerType.Low:
        return status === "locked"
          ? BoostLowLockedIcon
          : status === "used"
            ? BoostLowUsedIcon
            : BoostLowIcon;
      case PowerType.Foresight:
        return status === "locked"
          ? ForesightLockedIcon
          : status === "used"
            ? ForesightUsedIcon
            : ForesightIcon;
      case PowerType.DoubleUp:
        return status === "locked"
          ? DoubleUpLockedIcon
          : status === "used"
            ? DoubleUpUsedIcon
            : DoubleUpIcon;
      case PowerType.Halve:
        return status === "locked"
          ? HalveLockedIcon
          : status === "used"
            ? HalveUsedIcon
            : HalveIcon;
      case PowerType.Mirror:
        return status === "locked"
          ? MirrorLockedIcon
          : status === "used"
            ? MirrorUsedIcon
            : MirrorIcon;
      default:
        return () => null;
    }
  }
}
