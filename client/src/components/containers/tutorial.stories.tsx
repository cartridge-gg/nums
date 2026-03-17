import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tutorial } from "./tutorial";
import { fn } from "storybook/test";
import { Tutorial as TutorialModel, TutorialPhase } from "@/models/tutorial";

const meta = {
  title: "Containers/Tutorial",
  component: Tutorial,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Tutorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initialization: Story = {
  args: {
    ...TutorialModel.getData(TutorialPhase.Initialization),
    onClose: fn(),
    onPrimary: fn(),
    onSecondary: fn(),
  },
};

export const Start: Story = {
  args: TutorialModel.getData(TutorialPhase.Start),
};

export const Presentation: Story = {
  args: TutorialModel.getData(TutorialPhase.Presentation),
};

export const Terminal: Story = {
  args: TutorialModel.getData(TutorialPhase.Terminal),
};

export const Introduction: Story = {
  args: TutorialModel.getData(TutorialPhase.Introduction),
};

export const FirstNumber: Story = {
  args: TutorialModel.getData(TutorialPhase.FirstNumber),
};

export const Placement: Story = {
  args: TutorialModel.getData(TutorialPhase.Placement),
};

export const Success: Story = {
  args: TutorialModel.getData(TutorialPhase.Success),
};

export const NextNumber: Story = {
  args: TutorialModel.getData(TutorialPhase.NextNumber),
};

export const Randomness: Story = {
  args: TutorialModel.getData(TutorialPhase.Randomness),
};

export const Sequence: Story = {
  args: TutorialModel.getData(TutorialPhase.Sequence),
};

export const OptimalLocation: Story = {
  args: TutorialModel.getData(TutorialPhase.OptimalLocation),
};

export const Reward: Story = {
  args: TutorialModel.getData(TutorialPhase.Reward),
};

export const TrapIntroduction: Story = {
  args: TutorialModel.getData(TutorialPhase.TrapIntroduction),
};

export const TrapResult: Story = {
  args: TutorialModel.getData(TutorialPhase.TrapResult),
};
