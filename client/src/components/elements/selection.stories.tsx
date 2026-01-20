import type { Meta, StoryObj } from "@storybook/react-vite";
import { Selection } from "./selection";
import { Power, PowerType } from "@/types/power";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Selection",
  component: Selection,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    power: {
      control: false,
      description: "The power to display",
    },
    onClick: {
      action: "clicked",
      description: "Callback when Take button is clicked",
    },
  },
} satisfies Meta<typeof Selection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reroll: Story = {
  args: {
    power: new Power(PowerType.Reroll),
    onClick: fn(),
  },
};

export const Halve: Story = {
  args: {
    power: new Power(PowerType.Halve),
    onClick: fn(),
  },
};

export const Mirror: Story = {
  args: {
    power: new Power(PowerType.Mirror),
    onClick: fn(),
  },
};
