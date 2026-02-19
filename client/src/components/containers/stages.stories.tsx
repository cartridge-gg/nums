import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stages } from "./stages";
import type { StageState } from "../elements";

const meta = {
  title: "Containers/Stages",
  component: Stages,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Stages>;

export default meta;
type Story = StoryObj<typeof meta>;

const states: Array<StageState> = [
  {},
  { gem: true },
  {},
  {},
  {},
  { gem: true },
  {},
  {},
  {},
  { gem: true },
  {},
  { breakeven: true },
  {},
  { gem: true },
  {},
  {},
  {},
  { crown: true },
];

export const Default: Story = {
  args: {
    states,
  },
};

export const Over: Story = {
  args: {
    states,
    variant: "over",
  },
};

export const Completed: Story = {
  args: {
    states: states.map((state) => ({ ...state, completed: true })),
  },
};

export const OverCompleted: Story = {
  args: {
    states: states.map((state) => ({ ...state, completed: true })),
    variant: "over",
  },
};
