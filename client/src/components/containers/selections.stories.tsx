import type { Meta, StoryObj } from "@storybook/react-vite";
import { Selections } from "./selections";
import { Power, PowerType } from "@/types/power";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Selections",
  component: Selections,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  argTypes: {
    selections: {
      control: false,
      description: "Array of 2 SelectionProps to display",
    },
  },
} satisfies Meta<typeof Selections>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selections: [
      {
        power: new Power(PowerType.Reroll),
        onClick: fn(),
      },
      {
        power: new Power(PowerType.Halve),
        onClick: fn(),
      },
    ] as const,
  },
};

export const MirrorAndDoubleUp: Story = {
  args: {
    selections: [
      {
        power: new Power(PowerType.Mirror),
        onClick: fn(),
      },
      {
        power: new Power(PowerType.DoubleUp),
        onClick: fn(),
      },
    ] as const,
  },
};
