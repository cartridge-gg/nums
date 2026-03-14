import { Game } from "@/models/game";
import { Power } from "@/types/power";
import { Trap, TrapType } from "@/types/trap";
import {
  DEFAULT_SLOT_COUNT,
  DEFAULT_SLOT_MIN,
  DEFAULT_SLOT_MAX,
  DEFAULT_MULTIPLIER,
  DEFAULT_POWER_COUNT,
} from "@/constants";

export type TutorialStepType =
  | "tooltip"
  | "set"
  | "select"
  | "apply"
  | "state-override";

export interface TutorialScriptStep {
  id: string;
  type: TutorialStepType;
  // Tooltip config
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom";
  // Action config
  guidedIndex?: number; // Slot index for 'set', power index for 'select'/'apply'
  rngSeeds?: bigint[]; // Seeds for ScriptedRandom
  postOverrides?: Partial<Game>; // Fields to patch after engine runs
  stateOverrides?: Partial<Game>; // For 'state-override' type
}

/**
 * Tutorial script: 11 guided steps
 *
 * Initial board:
 *   Slots:  [_, _, 100, _, _, 300, _, _, _, _, 500, _, _, _, 800, _, _, _]
 *   Index:   0  1   2   3  4   5   6  7  8  9  10  11 12 13  14  15 16 17
 *   Traps:   -  -   -   -  -   -   -  -  -  -   -   -  ★   -   -   -  -  -
 *                                                        Lucky
 *   Number: 350    Next: 700    Level: 3
 */
export const TUTORIAL_SCRIPT: TutorialScriptStep[] = [
  // Step 0: Tooltip - Highlight current number (350)
  {
    id: "current-number",
    type: "tooltip",
    title: "Your Number",
    description: "This is the number you need to place.",
    targetSelector: '[data-tutorial="current-number"]',
    position: "bottom",
  },
  // Step 1: Tooltip - Highlight next number (700)
  {
    id: "next-number",
    type: "tooltip",
    title: "Up Next",
    description: "Plan ahead — you can see what's coming next.",
    targetSelector: '[data-tutorial="next-number"]',
    position: "bottom",
  },
  // Step 2: Tooltip - Highlight all slots
  {
    id: "ascending-order",
    type: "tooltip",
    title: "Ascending Order",
    description: "Numbers must go low to high across the board.",
    targetSelector: "[data-tutorial-slot]",
    position: "top",
  },
  // Step 3: Action:set - User places 350 in slot 5 (guided)
  {
    id: "place-number",
    type: "set",
    title: "Place Your Number",
    description: "Tap this slot to place 350 between 300 and 500.",
    targetSelector: "[data-tutorial-guided-slot]",
    position: "top",
    guidedIndex: 7,
    // RNG seeds for: game.update() -> next_number generation + power draw
    // game.update calls: this.next(cloneSlots, rand) which calls rand.nextUnique -> rand.between
    // then isDrawable() -> level 4, so Power.draw(rand.nextSeed(), 2)
    // We provide enough seeds to cover all calls
    rngSeeds: [700n, 42n],
    // After engine runs, override selectable_powers to be Swap + Reroll
    postOverrides: {
      selectable_powers: [
        new Power("Swap" as any),
        new Power("Reroll" as any),
      ],
    },
  },
  // Step 4: Action:select - Power draw appears. User picks Swap (index 0).
  {
    id: "select-power",
    type: "select",
    title: "Choose a Power-Up",
    description:
      "Pick Reroll to discard your current number and get a new one!",
    targetSelector: "[data-tutorial-guided-selection]",
    position: "bottom",
    guidedIndex: 1, // Select second power (Reroll)
  },
  // Step 5: Tooltip - Highlight trap slots
  {
    id: "traps",
    type: "tooltip",
    title: "Watch for Traps",
    description:
      "Some slots have special effects that trigger when you place a number.",
    targetSelector: "[data-tutorial-trap]",
    position: "top",
  },
  // Step 6: Action:set - User places 700 on slot 12 (Lucky trap)
  {
    id: "place-trap",
    type: "set",
    title: "Place on a Trap",
    description:
      "Place here to trigger the Lucky trap — it rerolls your number!",
    targetSelector: "[data-tutorial-guided-slot]",
    position: "top",
    guidedIndex: 12,
    // RNG seeds for: trap.apply (Lucky: rand.between for reroll) + game.update (next number)
    // Lucky trap calls rand.between(previous, next) where previous=500, next=800
    // Then game.update -> this.next(cloneSlots, rand) -> rand.nextUnique -> rand.between
    rngSeeds: [650n, 450n, 88n],
  },
  // Step 7: Tooltip - Highlight power-ups
  {
    id: "power-ups",
    type: "tooltip",
    title: "Use Power-Ups",
    description:
      "Use your powers to get out of tricky situations!",
    targetSelector: "[data-tutorial-powerup]",
    position: "bottom",
  },
  // Step 8: Action:apply - User uses Reroll power (index 0)
  {
    id: "apply-reroll",
    type: "apply",
    title: "Activate Reroll",
    description:
      "Tap Reroll to discard your number and get a new one!",
    targetSelector: "[data-tutorial-guided-power]",
    position: "bottom",
    guidedIndex: 0, // Apply first selected power (Reroll)
    rngSeeds: [450n, 450n], // Reroll calls rand.nextUnique -> rand.between
  },
  // Step 9: State override - Force game over
  {
    id: "game-over",
    type: "state-override",
    title: "Game Over",
    description:
      "Sometimes no slot fits. That's Game Over — try again!",
    targetSelector: '[data-tutorial="current-number"]',
    position: "bottom",
    stateOverrides: {
      over: 1, // Will be set to current timestamp
    },
  },
  // Step 10: Tooltip - Final message with "Play For Real" CTA
  {
    id: "ready",
    type: "tooltip",
    title: "You're Ready!",
    description:
      "Start a real game and earn rewards. Good luck!",
    targetSelector: "[data-tutorial-guided-instruction]",
    position: "top",
  },
];

/**
 * Create the pre-populated tutorial game.
 *
 * Board:
 *   Slots:  [_, _, 100, _, _, _, 300, _, _, 500, _, _, _, _, 800, _, _, _]
 *   Traps:  Lucky at index 12, rest None
 *   Number: 350, Next: 700, Level: 3
 */
export function createTutorialGame(): Game {
  const gameId = 999999; // Fixed tutorial game ID
  const mockTimestamp = Math.floor(Date.now() / 1000);

  // Pre-populated slots
  const slots = Array(DEFAULT_SLOT_COUNT).fill(0);
  slots[2] = 100;
  slots[5] = 300;
  slots[10] = 500;
  slots[14] = 800;

  // Traps: Lucky at index 12
  const traps: Trap[] = Array(DEFAULT_SLOT_COUNT)
    .fill(0)
    .map(() => Trap.from(0)); // All None
  traps[12] = new Trap(TrapType.Lucky);

  // All traps initially active (not disabled)
  const disabledTraps = Array(DEFAULT_SLOT_COUNT).fill(false);
  // Disable traps on pre-filled slots so they don't trigger
  disabledTraps[2] = true;
  disabledTraps[5] = true;
  disabledTraps[10] = true;
  disabledTraps[14] = true;

  const game = new Game(
    gameId,
    false, // claimed
    DEFAULT_MULTIPLIER,
    3, // level (so next placement triggers power draw at level 4)
    DEFAULT_SLOT_COUNT,
    DEFAULT_SLOT_MIN,
    DEFAULT_SLOT_MAX,
    350, // number
    700, // next_number
    [], // selectable_powers
    [], // selected_powers (empty, will fill during tutorial)
    Array(DEFAULT_POWER_COUNT).fill(false), // enabled_powers
    disabledTraps,
    0, // reward
    0, // over
    mockTimestamp + 24 * 60 * 60, // expiration
    traps,
    slots,
    1000000000000000000n, // supply (1e18)
    0n, // price
  );

  return game;
}
