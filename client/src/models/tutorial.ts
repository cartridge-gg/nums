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
  TrapResult,
  TrapDisabled,
  PowerIntroduction,
  PowerStages,
  PowerSelection,
  PowerResult,
  TrapNeutralized1,
  TrapNeutralized2,
  TrapNeutralized3,
  TrapNeutralized4,
}

export type TutorialAnchor =
  | { type: "multiplier" }
  | { type: "num" }
  | { type: "next_num" }
  | { type: "slot"; index: number }
  | { type: "slots" }
  | { type: "power"; index: number }
  | { type: "powers"; index: number }
  | { type: "reward" }
  | { type: "stages" };

export interface TutorialData {
  title?: string;
  instruction: {
    title: string;
    content: string;
  };
  primaryLabel?: string;
  secondaryLabel?: string;
  direction?: "left" | "right";
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
    [TutorialPhase.TrapResult]: {
      instruction: {
        title: "Expertly done",
        content:
          "You saved the sequence by pushing this number to this position with the windy slot.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "slot", index: 4 },
    },
    [TutorialPhase.TrapIntroduction]: {
      instruction: {
        title: "Trap tiles",
        content:
          "You must learn to navigate these. Hover over this windy slot to learn more about it's effect. Then, once you're ready, select it.",
      },
      direction: "left",
      anchor: { type: "slot", index: 2 },
    },
    [TutorialPhase.TrapDisabled]: {
      instruction: {
        title: "Trap disabled",
        content:
          "Notice now that the windy slot is disabled for good. Even if the slot is free again it won't trigger the trap again.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "slot", index: 2 },
    },
    [TutorialPhase.Reward]: {
      instruction: {
        title: "Even more NUMS",
        content:
          "And just like that, you're collecting NUMS! Even more than you did last time... Thats how things work around here the more sorting the better and excellence is rewarded.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "reward" },
    },
    [TutorialPhase.OptimalLocation]: {
      instruction: {
        title: "Put it here",
        content:
          "Quite obviously this is the optimal location for your number. You know the drill...",
      },
      direction: "left",
      anchor: { type: "slot", index: 16 },
    },
    [TutorialPhase.Sequence]: {
      instruction: {
        title: "Sequentialization",
        content:
          "You are a SORTER and the numbers need to be sorted. When you place your next number it needs to be placed in-sequence. Numbers CAN NOT be placed out-of sequence.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "slots" },
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
        title: "Randomized assignment",
        content:
          "Number assignment is random. You'll receive numbers between 1 and 999. Internalizing this will be instrumental to your success as a sorter.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "next_num" },
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
    [TutorialPhase.Placement]: {
      instruction: {
        title: "Place it here...",
        content:
          'My internal processes are telling me that this is the correct slot for this number. Click "Set" to add it to your terminal',
      },
      direction: "right",
      anchor: { type: "slot", index: 3 },
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
    [TutorialPhase.Presentation]: {
      instruction: {
        title: "I am your LLM manager",
        content:
          "and my current task is to maximize you human potential as a mechanical turk.",
      },
      primaryLabel: "Next",
      foreground: true,
    },
    [TutorialPhase.TrapNeutralized1]: {
      instruction: {
        title: "Trap neutralized",
        content:
          "We are going to neutralize the next trap in the sequence by surrounding it with numbers.",
      },
      primaryLabel: "Next",
      direction: "left",
      anchor: { type: "slot", index: 9 },
      disabled: true,
    },
    [TutorialPhase.TrapNeutralized2]: {
      instruction: {
        title: "Trap neutralized",
        content:
          "Place your number here to initiate the neutralization process.",
      },
      direction: "right",
      anchor: { type: "slot", index: 8 },
    },
    [TutorialPhase.TrapNeutralized3]: {
      instruction: {
        title: "Trap neutralized",
        content:
          "Place your number here to complete the neutralization process.",
      },
      direction: "left",
      anchor: { type: "slot", index: 10 },
    },
    [TutorialPhase.TrapNeutralized4]: {
      instruction: {
        title: "Trap neutralized",
        content:
          "You can now select the magnet slot. Its effect has been neutralized and won't affect the sequence.",
      },
      direction: "left",
      anchor: { type: "slot", index: 9 },
    },
    [TutorialPhase.PowerIntroduction]: {
      instruction: {
        title: "Keep sorting!",
        content: "Place your number here to continue sorting.",
      },
      direction: "left",
      anchor: { type: "slot", index: 14 },
    },
    [TutorialPhase.PowerStages]: {
      instruction: {
        title: "Stages",
        content:
          "After sorting enough numbers you will unlock new powers. Each power has a different effect and can be used to help you sort more efficiently.",
      },
      primaryLabel: "Next",
      direction: "right",
      anchor: { type: "stages" },
    },
    [TutorialPhase.PowerSelection]: {
      instruction: {
        title: "Power selection",
        content:
          "You can now select a power among two randomly selected powers. Power ups are limited and can only be used once. You will be able to use them later on.",
      },
      direction: "left",
      anchor: { type: "powers", index: 0 },
    },
    [TutorialPhase.PowerResult]: {
      instruction: {
        title: "Power inventory",
        content:
          "You can now view your power inventory. You can use them later on to help you sort more efficiently.",
      },
      primaryLabel: "Next",
      direction: "right",
      anchor: { type: "power", index: 0 },
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
    [TutorialPhase.TrapIntroduction]: TutorialPhase.TrapResult,
    [TutorialPhase.TrapResult]: TutorialPhase.TrapDisabled,
    [TutorialPhase.TrapDisabled]: TutorialPhase.PowerIntroduction,
    [TutorialPhase.PowerIntroduction]: TutorialPhase.PowerStages,
    [TutorialPhase.PowerStages]: TutorialPhase.PowerSelection,
    [TutorialPhase.PowerSelection]: TutorialPhase.PowerResult,
    [TutorialPhase.PowerResult]: TutorialPhase.TrapNeutralized1,
    [TutorialPhase.TrapNeutralized1]: TutorialPhase.TrapNeutralized2,
    [TutorialPhase.TrapNeutralized2]: TutorialPhase.TrapNeutralized3,
    [TutorialPhase.TrapNeutralized3]: TutorialPhase.TrapNeutralized4,
    [TutorialPhase.TrapNeutralized4]: null,
  };

  static getData(phase: TutorialPhase): TutorialData {
    return Tutorial.phases[phase];
  }

  static next(phase: TutorialPhase): TutorialPhase | null {
    return Tutorial.transitions[phase];
  }
}
