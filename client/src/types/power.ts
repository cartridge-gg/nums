import type * as React from "react";
import * as icons from "@/components/icons";
import { Packer } from "@/helpers/packer";
import { Game } from "@/models/game";
import {
  Reroll,
  DoubleUp,
  Halve,
  High,
  Low,
  Mirror,
  Foresight,
  Swap,
} from "@/elements/powers";

export const POWER_COUNT = 7;
export const DEFAULT_POWER_POINTS = 60;
export const POWER_COSTS = [5, 10, 15, 20, 25, 30, 35];

export enum PowerType {
  None = "None",
  Reroll = "Reroll",
  High = "High",
  Low = "Low",
  Swap = "Swap",
  DoubleUp = "Double Up",
  Halve = "Halve",
  Mirror = "Mirror",
  King = "King",
  Erase = "Erase",
  Foresight = "Foresight",
  Override = "Override",
  Gem = "Gem",
  Ribbon = "Ribbon",
  SquareDown = "Square Down",
  SquareUp = "Square Up",
  Wildcard = "Wildcard",
}

export type PowerIconStatus = "lock" | "used";
type PowerIconComponent = React.ElementType<icons.IconProps>;

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
    // Extract indexes from packed
    const indexes = Packer.unpack(bitmap, 4n);
    return indexes.map((index) => Power.from(index));
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

  public index(): number {
    switch (this.value) {
      case PowerType.Reroll:
        return 0;
      case PowerType.High:
        return 1;
      case PowerType.Low:
        return 2;
      case PowerType.Swap:
        return 3;
      case PowerType.DoubleUp:
        return 4;
      case PowerType.Halve:
        return 5;
      case PowerType.Mirror:
        return 6;
      case PowerType.King:
        return 7;
      case PowerType.Erase:
        return 8;
      case PowerType.Foresight:
        return 9;
      case PowerType.Override:
        return 10;
      case PowerType.Gem:
        return 11;
      case PowerType.Ribbon:
        return 12;
      case PowerType.SquareDown:
        return 13;
      case PowerType.SquareUp:
        return 14;
      case PowerType.Wildcard:
        return 15;
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
      case PowerType.Swap:
        return "Swap";
      case PowerType.DoubleUp:
        return "Double Up";
      case PowerType.Halve:
        return "Halve";
      case PowerType.Mirror:
        return "Mirror";
      case PowerType.King:
        return "King";
      case PowerType.Erase:
        return "Erase";
      case PowerType.Foresight:
        return "Foresight";
      case PowerType.Override:
        return "Override";
      case PowerType.Gem:
        return "Gem";
      case PowerType.Ribbon:
        return "Ribbon";
      case PowerType.SquareDown:
        return "Square Down";
      case PowerType.SquareUp:
        return "Square Up";
      case PowerType.Wildcard:
        return "Wildcard";
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
      case PowerType.Swap:
        return "Swap the current number with the next number";
      case PowerType.DoubleUp:
        return "Multiply the current number by two";
      case PowerType.Halve:
        return "Divide the current number by two";
      case PowerType.Mirror:
        return "Reflect the current number to it's complementary value";
      case PowerType.King:
        return "King power";
      case PowerType.Erase:
        return "Erase the current number";
      case PowerType.Foresight:
        return "Reveal the following number after this one";
      case PowerType.Override:
        return "Override the current number";
      case PowerType.Gem:
        return "Gem power";
      case PowerType.Ribbon:
        return "Ribbon power";
      case PowerType.SquareDown:
        return "Square down power";
      case PowerType.SquareUp:
        return "Square up power";
      case PowerType.Wildcard:
        return "Wildcard power";
      default:
        return "";
    }
  }

  public icon(status?: PowerIconStatus): PowerIconComponent {
    switch (this.value) {
      case PowerType.Reroll:
        return (
          status === "lock"
            ? icons.RerollLockedIcon
            : status === "used"
              ? icons.RerollUsedIcon
              : icons.RerollIcon
        ) as PowerIconComponent;
      case PowerType.High:
        return (
          status === "lock"
            ? icons.BoostHighLockedIcon
            : status === "used"
              ? icons.BoostHighUsedIcon
              : icons.BoostHighIcon
        ) as PowerIconComponent;
      case PowerType.Low:
        return (
          status === "lock"
            ? icons.BoostLowLockedIcon
            : status === "used"
              ? icons.BoostLowUsedIcon
              : icons.BoostLowIcon
        ) as PowerIconComponent;
      case PowerType.Swap:
        return (
          status === "lock"
            ? icons.SwapLockedIcon
            : status === "used"
              ? icons.SwapUsedIcon
              : icons.SwapIcon
        ) as PowerIconComponent;
      case PowerType.DoubleUp:
        return (
          status === "lock"
            ? icons.DoubleUpLockedIcon
            : status === "used"
              ? icons.DoubleUpUsedIcon
              : icons.DoubleUpIcon
        ) as PowerIconComponent;
      case PowerType.Halve:
        return (
          status === "lock"
            ? icons.HalveLockedIcon
            : status === "used"
              ? icons.HalveUsedIcon
              : icons.HalveIcon
        ) as PowerIconComponent;
      case PowerType.Mirror:
        return (
          status === "lock"
            ? icons.MirrorLockedIcon
            : status === "used"
              ? icons.MirrorUsedIcon
              : icons.MirrorIcon
        ) as PowerIconComponent;
      case PowerType.King:
        return (
          status === "lock"
            ? icons.KingLockedIcon
            : status === "used"
              ? icons.KingUsedIcon
              : icons.KingIcon
        ) as PowerIconComponent;
      case PowerType.Erase:
        return (
          status === "lock"
            ? icons.EraseLockedIcon
            : status === "used"
              ? icons.EraseUsedIcon
              : icons.EraseIcon
        ) as PowerIconComponent;
      case PowerType.Foresight:
        return (
          status === "lock"
            ? icons.ForesightLockedIcon
            : status === "used"
              ? icons.ForesightUsedIcon
              : icons.ForesightIcon
        ) as PowerIconComponent;
      case PowerType.Override:
        return (
          status === "lock"
            ? icons.OverrideLockedIcon
            : status === "used"
              ? icons.OverrideUsedIcon
              : icons.OverrideIcon
        ) as PowerIconComponent;
      case PowerType.Gem:
        return (
          status === "lock"
            ? icons.GemLockedIcon
            : status === "used"
              ? icons.GemUsedIcon
              : icons.GemIcon
        ) as PowerIconComponent;
      case PowerType.Ribbon:
        return (
          status === "lock"
            ? icons.RibbonLockedIcon
            : status === "used"
              ? icons.RibbonUsedIcon
              : icons.RibbonIcon
        ) as PowerIconComponent;
      case PowerType.SquareDown:
        return (
          status === "lock"
            ? icons.SquareDownLockedIcon
            : status === "used"
              ? icons.SquareDownUsedIcon
              : icons.SquareDownIcon
        ) as PowerIconComponent;
      case PowerType.SquareUp:
        return (
          status === "lock"
            ? icons.SquareUpLockedIcon
            : status === "used"
              ? icons.SquareUpUsedIcon
              : icons.SquareUpIcon
        ) as PowerIconComponent;
      case PowerType.Wildcard:
        return (
          status === "lock"
            ? icons.WildcardLockedIcon
            : status === "used"
              ? icons.WildcardUsedIcon
              : icons.WildcardIcon
        ) as PowerIconComponent;
      default:
        return icons.GemIcon as PowerIconComponent;
    }
  }

  public color(): string {
    switch (this.value) {
      case PowerType.Reroll:
        return "text-reroll-100";
      case PowerType.High:
        return "text-high-100";
      case PowerType.Low:
        return "text-low-100";
      case PowerType.Swap:
        return "text-swap-100";
      case PowerType.DoubleUp:
        return "text-double-100";
      case PowerType.Halve:
        return "text-halve-100";
      case PowerType.Mirror:
        return "text-blue-100";
      case PowerType.King:
        return "text-pink-100";
      case PowerType.Erase:
        return "text-pink-100";
      case PowerType.Foresight:
        return "text-foresight-100";
      case PowerType.Override:
        return "text-red-300";
      case PowerType.Gem:
        return "text-gem-100";
      case PowerType.Ribbon:
        return "text-ribbon-100";
      case PowerType.SquareDown:
        return "text-down-100";
      case PowerType.SquareUp:
        return "text-up-100";
      case PowerType.Wildcard:
        return "text-wildcard-100";
      default:
        return "text-down-100";
    }
  }

  public buttonColor(): string {
    switch (this.value) {
      case PowerType.Reroll:
        return "bg-reroll-100 hover:bg-reroll-200";
      case PowerType.High:
        return "bg-high-100 hover:bg-high-200";
      case PowerType.Low:
        return "bg-low-100 hover:bg-low-200";
      case PowerType.Swap:
        return "bg-swap-100 hover:bg-swap-200";
      case PowerType.DoubleUp:
        return "bg-double-100 hover:bg-double-200";
      case PowerType.Halve:
        return "bg-halve-100 hover:bg-halve-200";
      case PowerType.Mirror:
        return "bg-blue-100 hover:bg-blue-200";
      case PowerType.King:
        return "bg-pink-100 hover:bg-pink-200";
      case PowerType.Erase:
        return "bg-pink-100 hover:bg-pink-200";
      case PowerType.Foresight:
        return "bg-foresight-100 hover:bg-foresight-200";
      case PowerType.Override:
        return "bg-red-100 hover:bg-red-200";
      case PowerType.Gem:
        return "bg-gem-100 hover:bg-gem-200";
      case PowerType.Ribbon:
        return "bg-ribbon-100 hover:bg-ribbon-200";
      case PowerType.SquareDown:
        return "bg-down-100 hover:bg-down-200";
      case PowerType.SquareUp:
        return "bg-up-100 hover:bg-up-200";
      case PowerType.Wildcard:
        return "bg-wildcard-100 hover:bg-wildcard-200";
      default:
        return "bg-down-100 hover:bg-down-200";
    }
  }

  /**
   * Apply the power to the game
   * Equivalent to PowerTrait::apply in types/power.cairo
   */
  public apply(game: Game): void {
    switch (this.value) {
      case PowerType.None:
        // No operation
        break;
      case PowerType.Reroll:
        Reroll.apply(game);
        break;
      case PowerType.High:
        High.apply(game);
        break;
      case PowerType.Low:
        Low.apply(game);
        break;
      case PowerType.Swap:
        Swap.apply(game);
        break;
      case PowerType.DoubleUp:
        DoubleUp.apply(game);
        break;
      case PowerType.Halve:
        Halve.apply(game);
        break;
      case PowerType.Mirror:
        Mirror.apply(game);
        break;
      case PowerType.Foresight:
        Foresight.apply(game);
        break;
      default:
        // Other powers not implemented yet
        break;
    }
  }

  /**
   * Check if the power can rescue the game
   * Equivalent to PowerTrait::rescue in types/power.cairo
   */
  public rescue(game: Game): boolean {
    switch (this.value) {
      case PowerType.None:
        return false;
      case PowerType.Reroll:
        return Reroll.rescue(game);
      case PowerType.High:
        return High.rescue(game);
      case PowerType.Low:
        return Low.rescue(game);
      case PowerType.Swap:
        return Swap.rescue(game);
      case PowerType.DoubleUp:
        return DoubleUp.rescue(game);
      case PowerType.Halve:
        return Halve.rescue(game);
      case PowerType.Mirror:
        return Mirror.rescue(game);
      case PowerType.Foresight:
        return Foresight.rescue(game);
      default:
        // Other powers not implemented yet
        return false;
    }
  }
}
