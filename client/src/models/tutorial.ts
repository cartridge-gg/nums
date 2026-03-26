export enum TutorialPhase {
  Initialization,
  Start,
  Presentation,
  Terminal,
  Introduction,
  FirstNumber,
  Placement,
  Success,
  NextNumber,
  Prediction,
  Randomness,
  Sequence,
  OptimalLocation,
  Reward,
  TrapIntroduction,
  TrapSet,
  TrapResult,
  PowerIntroduction,
  PowerUnlock,
  PowerSelection,
  PowerUp,
  PowerUse,
  PowerResult,
  End,
}

export type TutorialAnchor =
  | { type: "multiplier" }
  | { type: "num" }
  | { type: "next_num" }
  | { type: "slot"; index: number }
  | { type: "slots" }
  | { type: "power"; index: number }
  | { type: "select"; index: number }
  | { type: "set" }
  | { type: "use" }
  | { type: "reward" }
  | { type: "stage"; index: number };

export interface TutorialData {
  title?: string;
  instruction: {
    title: string;
    content: string;
  };
  primaryLabel?: string;
  secondaryLabel?: string;
  direction?: "left" | "right" | "up" | "down";
  foreground?: boolean;
  anchor?: TutorialAnchor;
  disabled?: boolean;
}

export class Tutorial {
  private static phases: Record<TutorialPhase, TutorialData> = {
    [TutorialPhase.Initialization]: {
      title: "Hello Sorter!",
      instruction: {
        title: "I don't recognize you...",
        content: "Have you completed the mandatory employee onboarding?",
      },
      primaryLabel: '"I\'m new around here"',
      secondaryLabel: "Skip Tutorial",
      foreground: true,
    },
    [TutorialPhase.Start]: {
      instruction: {
        title: "...No?",
        content: "Right then, lets start your training.",
      },
      primaryLabel: "Continue",
      foreground: true,
    },
    [TutorialPhase.Presentation]: {
      instruction: {
        title: "I am your LLM manager",
        content:
          "My current task is to maximize your human potential as a number sorter.",
      },
      primaryLabel: "Next",
      foreground: true,
    },
    [TutorialPhase.Terminal]: {
      instruction: {
        title: "Lets take a quick tour",
        content: "We'll get you familiarized with your new employee terminal.",
      },
      primaryLabel: "Next",
      foreground: true,
    },
    [TutorialPhase.Introduction]: {
      instruction: {
        title: "Your new terminal!",
        content:
          "Newly equipped with the most advanced number sorting technology on the internet.",
      },
      primaryLabel: "Next",
    },
    [TutorialPhase.FirstNumber]: {
      instruction: {
        title: "Your first number",
        content:
          "How exciting, I can observe your enthusiasm through your cursor movements. Are you ready to start sorting?",
      },
      primaryLabel: "I'm ready",
      direction: "right",
      anchor: { type: "num" },
    },
    [TutorialPhase.Placement]: {
      instruction: {
        title: "Place it here...",
        content:
          'My internal processes are telling me that this is the correct slot for this number. Click "Set" to add it to your terminal',
      },
      direction: "right",
      anchor: { type: "slot", index: 2 },
    },
    [TutorialPhase.Success]: {
      instruction: {
        title: "Success!",
        content:
          "As a reward for your quick decision making in a high pressure environment we've given you some NUMS.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "reward" },
    },
    [TutorialPhase.NextNumber]: {
      instruction: {
        title: "Your next number...",
        content:
          "Oh, you recognize it? Outstanding your observational skills are well above average for a human.",
      },
      primaryLabel: "Next",
      direction: "right",
      anchor: { type: "num" },
    },
    [TutorialPhase.Prediction]: {
      instruction: {
        title: "That's right!",
        content:
          "You can always see what's coming next. With careful planning this should eliminate any and all mistakes.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "next_num" },
    },
    [TutorialPhase.Randomness]: {
      instruction: {
        title: "Numbers are randomized",
        content:
          "Number assignment is random. You'll receive numbers between **1** and **999**. Internalizing this will be instrumental to your success as a sorter.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "next_num" },
    },
    [TutorialPhase.Sequence]: {
      instruction: {
        title: "Place them in-sequence",
        content:
          "Numbers need to be sorted numerically. Low numbers must be placed before high numbers.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "slots" },
    },
    [TutorialPhase.OptimalLocation]: {
      instruction: {
        title: "Put it here",
        content:
          "Quite obviously this is the optimal location for your number. You know the drill...",
      },
      direction: "left",
      anchor: { type: "slot", index: 11 },
    },
    [TutorialPhase.Reward]: {
      instruction: {
        title: "Even more NUMS",
        content:
          "And just like that, you're collecting NUMS! Even more than you did last time...",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "reward" },
    },
    [TutorialPhase.TrapIntroduction]: {
      instruction: {
        title: "Trap tiles",
        content:
          "You must learn to navigate these. Hover over this windy slot to learn more about it's effect. Then, once you're ready, select it.",
      },
      direction: "left",
      anchor: { type: "slot", index: 1 },
    },
    [TutorialPhase.TrapSet]: {
      instruction: {
        title: 'Click "Set"',
        content: "And place your number on the Windy Trap.",
      },
      direction: "left",
      anchor: { type: "set" },
    },
    [TutorialPhase.TrapResult]: {
      instruction: {
        title: "Expertly done",
        content:
          "The Windy Trap activated and it's effect pushed a previously placed number away.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "slot", index: 3 },
    },
    [TutorialPhase.PowerIntroduction]: {
      instruction: {
        title: "Power ups",
        content:
          "After placing your next tile you will be awarded a power up. ",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "stage", index: 3 },
    },
    [TutorialPhase.PowerUnlock]: {
      instruction: {
        title: "Next Number here",
        content: "You know the drill...",
      },
      direction: "right",
      anchor: { type: "slot", index: 2 },
    },
    [TutorialPhase.PowerSelection]: {
      instruction: {
        title: "Take Power up",
        content:
          "The Reroll Power Up gets you a redo. Lets grab it, this will be useful later. ",
      },
      direction: "left",
      anchor: { type: "select", index: 0 },
    },
    [TutorialPhase.PowerUp]: {
      instruction: {
        title: "Use Reroll powerup",
        content: "Your power ups are stored here. lets use it. ",
      },
      direction: "right",
      anchor: { type: "power", index: 0 },
    },
    [TutorialPhase.PowerUse]: {
      instruction: {
        title: 'Click "Use"',
        content:
          "Using the reroll powerup will discard and reroll the current number.",
      },
      direction: "left",
      anchor: { type: "use" },
    },
    [TutorialPhase.PowerResult]: {
      instruction: {
        title: "Your rerolled number",
        content:
          "And here it is, your reroll power up replaced your old number with a new one.",
      },
      primaryLabel: "Continue",
      direction: "right",
      anchor: { type: "num" },
    },
    [TutorialPhase.End]: {
      instruction: {
        title: "Training complete",
        content:
          "With these concepts you have everything you need to become a premier number sorter.",
      },
      primaryLabel: "Finish Tutorial",
      foreground: true,
    },
  };

  private static transitions: Record<TutorialPhase, TutorialPhase | null> = {
    [TutorialPhase.Initialization]: TutorialPhase.Start,
    [TutorialPhase.Start]: TutorialPhase.Presentation,
    [TutorialPhase.Presentation]: TutorialPhase.Terminal,
    [TutorialPhase.Terminal]: TutorialPhase.Introduction,
    [TutorialPhase.Introduction]: TutorialPhase.FirstNumber,
    [TutorialPhase.FirstNumber]: TutorialPhase.Placement,
    [TutorialPhase.Placement]: TutorialPhase.Success,
    [TutorialPhase.Success]: TutorialPhase.NextNumber,
    [TutorialPhase.NextNumber]: TutorialPhase.Prediction,
    [TutorialPhase.Prediction]: TutorialPhase.Randomness,
    [TutorialPhase.Randomness]: TutorialPhase.Sequence,
    [TutorialPhase.Sequence]: TutorialPhase.OptimalLocation,
    [TutorialPhase.OptimalLocation]: TutorialPhase.Reward,
    [TutorialPhase.Reward]: TutorialPhase.TrapIntroduction,
    [TutorialPhase.TrapIntroduction]: TutorialPhase.TrapSet,
    [TutorialPhase.TrapSet]: TutorialPhase.TrapResult,
    [TutorialPhase.TrapResult]: TutorialPhase.PowerIntroduction,
    [TutorialPhase.PowerIntroduction]: TutorialPhase.PowerUnlock,
    [TutorialPhase.PowerUnlock]: TutorialPhase.PowerSelection,
    [TutorialPhase.PowerSelection]: TutorialPhase.PowerUp,
    [TutorialPhase.PowerUp]: TutorialPhase.PowerUse,
    [TutorialPhase.PowerUse]: TutorialPhase.PowerResult,
    [TutorialPhase.PowerResult]: TutorialPhase.End,
    [TutorialPhase.End]: null,
  };

  static getData(phase: TutorialPhase): TutorialData {
    return Tutorial.phases[phase];
  }

  static next(phase: TutorialPhase): TutorialPhase | null {
    return Tutorial.transitions[phase];
  }
}
