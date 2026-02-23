import type * as React from "react";
import * as icons from "@/components/icons";
import { Packer } from "@/helpers";
import type { Game } from "@/models/game";
import { Bomb, Lucky, Magnet, Ufo, Windy } from "@/elements/traps";
import type { Random } from "@/helpers/random";
import { Deck } from "@/helpers/deck";

export const TRAP_COUNT = 5;
const MULTIPLIER = 10000n;

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

  /**
   * Apply the trap to the game
   * Equivalent to TrapTrait::apply in types/trap.cairo
   */
  public apply(game: Game, slotIndex: number, rand: Random): void {
    switch (this.value) {
      case TrapType.None:
        // No operation
        break;
      case TrapType.Bomb:
        new Bomb().apply(game, slotIndex, rand);
        break;
      case TrapType.Lucky:
        new Lucky().apply(game, slotIndex, rand);
        break;
      case TrapType.Magnet:
        new Magnet().apply(game, slotIndex, rand);
        break;
      case TrapType.UFO:
        new Ufo().apply(game, slotIndex, rand);
        break;
      case TrapType.Windy:
        new Windy().apply(game, slotIndex, rand);
        break;
    }
  }

  /**
   * Generate traps array
   * Equivalent to TrapTrait::generate in types/trap.cairo
   */
  public static generate(
    count: number,
    total: number,
    random: Random,
  ): number[] {
    const traps: number[] = [];
    const deck = Deck.new(random.nextSeed(), TRAP_COUNT);
    Trap.iter(total, count, deck, random, traps);
    return traps;
  }

  /**
   * Iterate to generate traps
   * Equivalent to TrapTrait::iter in types/trap.cairo
   */
  private static iter(
    total: number,
    count: number,
    deck: Deck,
    random: Random,
    traps: number[],
  ): void {
    // [Check] Stop if all objects are placed
    if (total === 0) {
      return;
    }
    // [Check] Stop if all objects are placed
    if (count === 0) {
      // Fill remaining slots with 0
      for (let i = 0; i < total; i++) {
        traps.push(0);
      }
      return;
    }
    // [Compute] Uniform random number between 0 and MULTIPLIER
    const seed = random.nextSeed();
    const rng = seed % MULTIPLIER;
    const probability = (BigInt(count) * MULTIPLIER) / BigInt(total);
    // [Check] Probability of being an object
    if (rng < probability) {
      // [Effect] Draw a trap
      traps.push(deck.draw());
      Trap.iter(total - 1, count - 1, deck, random, traps);
    } else {
      traps.push(0);
      Trap.iter(total - 1, count, deck, random, traps);
    }
  }
}
