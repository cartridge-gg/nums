import type { Meta, StoryObj } from "@storybook/react-vite";
import { PowerUps } from "./power-ups";
import { Power, PowerType } from "@/types/power";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Power Ups",
  component: PowerUps,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
} satisfies Meta<typeof PowerUps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    powers: [{}, {}, {}, {}],
  },
};

export const Mix: Story = {
  args: {
    powers: [
      {
        power: new Power(PowerType.Reroll),
        status: "used" as const,
        onClick: fn(),
      },
      {
        power: new Power(PowerType.High),
        status: "lock" as const,
        onClick: fn(),
      },
      { power: new Power(PowerType.Low), onClick: fn() },
      {
        power: new Power(PowerType.Swap),
        status: "used" as const,
        onClick: fn(),
      },
    ],
  },
};
