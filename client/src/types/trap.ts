import type * as React from "react";
import * as icons from "@/components/icons";
import { Packer } from "@/helpers";

export const TRAP_COUNT = 6;

export enum TrapType {
  None = "None",
  Bomb = "Bomb",
  Lucky = "Lucky",
  Magnet = "Magnet",
  UFO = "UFO",
  Windy = "Windy",
}

export type TrapIconStatus = "used" | "shadow";
type TrapIconComponent = React.ElementType<icons.IconProps>;

export class Trap {
  value: TrapType;

  constructor(value: TrapType) {
    this.value = value;
  }

  public into(): number {
    return Object.values(TrapType).indexOf(this.value);
  }

  public static from(index: number): Trap {
    const item = Object.values(TrapType)[index];
    return new Trap(item);
  }

  public static getAllTraps(): Trap[] {
    return Object.values(TrapType)
      .slice(1)
      .map((value) => new Trap(value));
  }

  public static getTraps(bitmap: bigint): Trap[] {
    // Extract indexes from packed
    const indexes = Packer.sized_unpack(bitmap, 4n, 20);
    return indexes.map((index) => Trap.from(index));
  }

  public isNone(): boolean {
    return this.value === TrapType.None;
  }

  public index(): number {
    switch (this.value) {
      case TrapType.Bomb:
        return 0;
      case TrapType.Lucky:
        return 1;
      case TrapType.Magnet:
        return 2;
      case TrapType.UFO:
        return 3;
      case TrapType.Windy:
        return 4;
      default:
        return -1;
    }
  }

  public name(): string {
    switch (this.value) {
      case TrapType.Bomb:
        return "Bomb Slot";
      case TrapType.Lucky:
        return "Lucky Slot";
      case TrapType.Magnet:
        return "Magnet Slot";
      case TrapType.UFO:
        return "UFO Slot";
      case TrapType.Windy:
        return "Windy Slot";
      default:
        return "";
    }
  }

  public description(): string {
    switch (this.value) {
      case TrapType.Bomb:
        return "Reroll the two nearest set numbers after a number is placed here";
      case TrapType.Lucky:
        return "Reroll this tile after a number is placed here";
      case TrapType.Magnet:
        return "Pull the two nearest set numbers towards this tile";
      case TrapType.UFO:
        return "Move this tile to a random slot after a number is placed here";
      case TrapType.Windy:
        return "Push the two nearest set numbers away from this tile";
      default:
        return "";
    }
  }

  public icon(status?: TrapIconStatus): TrapIconComponent {
    switch (this.value) {
      case TrapType.Bomb:
        return (
          status === "used"
            ? icons.BombUsedIcon
            : status === "shadow"
              ? icons.BombShadowIcon
              : icons.BombIcon
        ) as TrapIconComponent;
      case TrapType.Lucky:
        return (
          status === "used"
            ? icons.LuckyUsedIcon
            : status === "shadow"
              ? icons.LuckyShadowIcon
              : icons.LuckyIcon
        ) as TrapIconComponent;
      case TrapType.Magnet:
        return (
          status === "used"
            ? icons.MagnetUsedIcon
            : status === "shadow"
              ? icons.MagnetShadowIcon
              : icons.MagnetIcon
        ) as TrapIconComponent;
      case TrapType.UFO:
        return (
          status === "used"
            ? icons.UfoUsedIcon
            : status === "shadow"
              ? icons.UfoShadowIcon
              : icons.UfoIcon
        ) as TrapIconComponent;
      case TrapType.Windy:
        return (
          status === "used"
            ? icons.WindyUsedIcon
            : status === "shadow"
              ? icons.WindyShadowIcon
              : icons.WindyIcon
        ) as TrapIconComponent;
      default:
        return icons.BombIcon as TrapIconComponent;
    }
  }

  public color(): string {
    switch (this.value) {
      case TrapType.Bomb:
        return "text-bomb-100";
      case TrapType.Lucky:
        return "text-lucky-100";
      case TrapType.Magnet:
        return "text-magnet-100";
      case TrapType.UFO:
        return "text-ufo-100";
      case TrapType.Windy:
        return "text-windy-100";
      default:
        return "";
    }
  }

  public buttonColor(): string {
    switch (this.value) {
      case TrapType.Bomb:
        return "bg-bomb-100 hover:bg-bomb-200";
      case TrapType.Lucky:
        return "bg-lucky-100 hover:bg-lucky-200";
      case TrapType.Magnet:
        return "bg-magnet-100 hover:bg-magnet-200";
      case TrapType.UFO:
        return "bg-ufo-100 hover:bg-ufo-200";
      case TrapType.Windy:
        return "bg-windy-100 hover:bg-windy-200";
      default:
        return "";
    }
  }

  public bgColor(): string {
    switch (this.value) {
      case TrapType.Bomb:
        return "bg-bomb-500 hover:bg-bomb-400";
      case TrapType.Lucky:
        return "bg-lucky-500 hover:bg-lucky-400";
      case TrapType.Magnet:
        return "bg-magnet-500 hover:bg-magnet-400";
      case TrapType.UFO:
        return "bg-ufo-500 hover:bg-ufo-400";
      case TrapType.Windy:
        return "bg-windy-500 hover:bg-windy-400";
      default:
        return "";
    }
  }

  public outlineColor(): string {
    switch (this.value) {
      case TrapType.Bomb:
        return "outline-bomb-100";
      case TrapType.Lucky:
        return "outline-lucky-100";
      case TrapType.Magnet:
        return "outline-magnet-100";
      case TrapType.UFO:
        return "outline-ufo-100";
      case TrapType.Windy:
        return "outline-windy-100";
      default:
        return "";
    }
  }
}
