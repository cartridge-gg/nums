import { describe, test, expect } from "vitest";
import {
  TUTORIAL_SCRIPT,
  createTutorialGame,
} from "./script";
import { ScriptedRandom } from "@/helpers/scripted-random";
import { TrapType } from "@/types/trap";
import { DEFAULT_SLOT_COUNT } from "@/constants";

describe("createTutorialGame", () => {
  test("creates game with correct initial board state", () => {
    const game = createTutorialGame();

    expect(game.id).toBe(999999);
    expect(game.number).toBe(350);
    expect(game.next_number).toBe(700);
    expect(game.level).toBe(3);
    expect(game.slot_count).toBe(DEFAULT_SLOT_COUNT);
    expect(game.over).toBe(0);

    // Pre-populated slots
    expect(game.slots[2]).toBe(100);
    expect(game.slots[5]).toBe(300);
    expect(game.slots[10]).toBe(500);
    expect(game.slots[14]).toBe(800);

    // Empty slots
    expect(game.slots[0]).toBe(0);
    expect(game.slots[7]).toBe(0);
    expect(game.slots[12]).toBe(0);
  });

  test("has Lucky trap at index 12", () => {
    const game = createTutorialGame();
    expect(game.traps[12].value).toBe(TrapType.Lucky);
  });

  test("traps on pre-filled slots are disabled", () => {
    const game = createTutorialGame();
    expect(game.disabled_traps[2]).toBe(true);
    expect(game.disabled_traps[5]).toBe(true);
    expect(game.disabled_traps[10]).toBe(true);
    expect(game.disabled_traps[14]).toBe(true);
    // Lucky trap slot is NOT disabled
    expect(game.disabled_traps[12]).toBe(false);
  });

  test("starts with no powers", () => {
    const game = createTutorialGame();
    expect(game.selectable_powers).toHaveLength(0);
    expect(game.selected_powers).toHaveLength(0);
  });
});

describe("TUTORIAL_SCRIPT", () => {
  test("has 11 steps", () => {
    expect(TUTORIAL_SCRIPT).toHaveLength(11);
  });

  test("starts with tooltip steps", () => {
    expect(TUTORIAL_SCRIPT[0].type).toBe("tooltip");
    expect(TUTORIAL_SCRIPT[1].type).toBe("tooltip");
    expect(TUTORIAL_SCRIPT[2].type).toBe("tooltip");
  });

  test("has correct action step types", () => {
    expect(TUTORIAL_SCRIPT[3].type).toBe("set");
    expect(TUTORIAL_SCRIPT[4].type).toBe("select");
    expect(TUTORIAL_SCRIPT[6].type).toBe("set");
    expect(TUTORIAL_SCRIPT[8].type).toBe("apply");
    expect(TUTORIAL_SCRIPT[9].type).toBe("state-override");
  });

  test("every step has id, title, and description", () => {
    for (const step of TUTORIAL_SCRIPT) {
      expect(step.id).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });

  test("action steps have guidedIndex", () => {
    const actionSteps = TUTORIAL_SCRIPT.filter(
      (s) => s.type === "set" || s.type === "select" || s.type === "apply",
    );
    for (const step of actionSteps) {
      expect(step.guidedIndex).toBeDefined();
    }
  });

  test("set and apply steps have rngSeeds", () => {
    const seedSteps = TUTORIAL_SCRIPT.filter(
      (s) => s.type === "set" || s.type === "apply",
    );
    for (const step of seedSteps) {
      expect(step.rngSeeds).toBeDefined();
      expect(step.rngSeeds!.length).toBeGreaterThan(0);
    }
  });
});

describe("Tutorial flow smoke test", () => {
  test("step 3: place 350 in slot 7", () => {
    const game = createTutorialGame();
    const step = TUTORIAL_SCRIPT[3]; // set step

    const rand = new ScriptedRandom(step.rngSeeds!);
    game.place(game.number, step.guidedIndex!, rand);
    game.update(rand, 0n);

    // 350 should be in slot 7
    expect(game.slots[7]).toBe(350);
    // Level should have incremented
    expect(game.level).toBe(4);
    // Number should have advanced (was next_number: 700)
    expect(game.number).toBe(700);

    // Apply post-overrides
    if (step.postOverrides) {
      Object.assign(game, step.postOverrides);
    }
    expect(game.selectable_powers).toHaveLength(2);
  });

  test("step 4: select power (Reroll at index 1)", () => {
    const game = createTutorialGame();

    // Run step 3 first
    const step3 = TUTORIAL_SCRIPT[3];
    const rand3 = new ScriptedRandom(step3.rngSeeds!);
    game.place(game.number, step3.guidedIndex!, rand3);
    game.update(rand3, 0n);
    if (step3.postOverrides) Object.assign(game, step3.postOverrides);

    // Step 4: select
    const step4 = TUTORIAL_SCRIPT[4];
    game.select(step4.guidedIndex!);

    // Selectable powers should be cleared
    expect(game.selectable_powers).toHaveLength(0);
    // Should have a selected power
    expect(game.selected_powers.length).toBeGreaterThan(0);
  });

  test("step 6: place 700 on slot 12 (Lucky trap)", () => {
    const game = createTutorialGame();

    // Run steps 3-4
    const step3 = TUTORIAL_SCRIPT[3];
    const rand3 = new ScriptedRandom(step3.rngSeeds!);
    game.place(game.number, step3.guidedIndex!, rand3);
    game.update(rand3, 0n);
    if (step3.postOverrides) Object.assign(game, step3.postOverrides);
    game.select(TUTORIAL_SCRIPT[4].guidedIndex!);

    // Step 6: place on Lucky trap
    const step6 = TUTORIAL_SCRIPT[6];
    const rand6 = new ScriptedRandom(step6.rngSeeds!);
    game.place(game.number, step6.guidedIndex!, rand6);
    game.update(rand6, 0n);

    // Slot 12 should have a value (Lucky trap rerolls it)
    expect(game.slots[12]).not.toBe(0);
    // Trap should now be disabled
    expect(game.disabled_traps[12]).toBe(true);
    // Level should have incremented again
    expect(game.level).toBe(5);
  });

  test("step 8: apply Reroll power", () => {
    const game = createTutorialGame();

    // Run steps 3, 4, 6
    const step3 = TUTORIAL_SCRIPT[3];
    const rand3 = new ScriptedRandom(step3.rngSeeds!);
    game.place(game.number, step3.guidedIndex!, rand3);
    game.update(rand3, 0n);
    if (step3.postOverrides) Object.assign(game, step3.postOverrides);
    game.select(TUTORIAL_SCRIPT[4].guidedIndex!);

    const step6 = TUTORIAL_SCRIPT[6];
    const rand6 = new ScriptedRandom(step6.rngSeeds!);
    game.place(game.number, step6.guidedIndex!, rand6);
    game.update(rand6, 0n);

    const numberBefore = game.number;

    // Step 8: apply Reroll
    const step8 = TUTORIAL_SCRIPT[8];
    const rand8 = new ScriptedRandom(step8.rngSeeds!);
    game.applyPower(step8.guidedIndex!, rand8);

    // Number should have changed (Reroll redraws)
    expect(game.number).not.toBe(numberBefore);
  });
});
