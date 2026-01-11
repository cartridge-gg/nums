import type { Meta, StoryObj } from "@storybook/react-vite";
import { PowerUp } from "./power-up";
import { Power, PowerType } from "@/types/power";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/PowerUp",
  component: PowerUp,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    power: {
      control: false,
      description: "The power object",
    },
    status: {
      control: "select",
      options: ["lock", "used", undefined],
      description: "The status of the power icon",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant of the power up",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size of the power up",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof PowerUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reroll: Story = {
  args: {
    power: new Power(PowerType.Reroll),
  },
};

export const RerollLocked: Story = {
  args: {
    power: new Power(PowerType.Reroll),
    status: "lock",
  },
};

export const RerollUsed: Story = {
  args: {
    power: new Power(PowerType.Reroll),
    status: "used",
  },
};
