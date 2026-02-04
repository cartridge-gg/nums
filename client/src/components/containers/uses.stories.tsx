import type { Meta, StoryObj } from "@storybook/react-vite";
import { Uses } from "./uses";
import { Power, PowerType } from "@/types/power";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Uses",
  component: Uses,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    use: {
      control: false,
      description: "SelectionProps to display",
    },
    onClose: {
      action: "closed",
      description: "Callback when close button is clicked",
    },
  },
} satisfies Meta<typeof Uses>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    use: {
      power: new Power(PowerType.Reroll),
      onClick: fn(),
    },
  },
};

export const Mirror: Story = {
  args: {
    use: {
      power: new Power(PowerType.Mirror),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const Halve: Story = {
  args: {
    use: {
      power: new Power(PowerType.Halve),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const DoubleUp: Story = {
  args: {
    use: {
      power: new Power(PowerType.DoubleUp),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const High: Story = {
  args: {
    use: {
      power: new Power(PowerType.High),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const Low: Story = {
  args: {
    use: {
      power: new Power(PowerType.Low),
      onClick: fn(),
    },
    onClose: fn(),
  },
};
