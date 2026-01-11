import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameScene } from "./game-scene";
import { Power, PowerType } from "@/types/power";

const meta = {
  title: "Layout/Game Scene",
  component: GameScene,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  argTypes: {
    currentNumber: {
      control: "number",
      description: "The current number displayed",
    },
    nextNumber: {
      control: "number",
      description: "The next number to be displayed",
    },
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
} satisfies Meta<typeof GameScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentNumber: 262,
    nextNumber: 679,
    powers: [
      { power: new Power(PowerType.Reroll) },
      { power: new Power(PowerType.High), status: "lock" as const },
      { power: new Power(PowerType.Low) },
      {},
    ],
    slots: [0, 0, 0, 0, 0, 0, 300, 312, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    stages: [
      {},
      {},
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
    ],
    className: "h-[calc(100vh-32px)] md:h-full",
  },
};

export const Rescuable: Story = {
  args: {
    currentNumber: 313,
    nextNumber: 679,
    powers: [{ power: new Power(PowerType.Reroll) }, {}, {}, {}],
    slots: [0, 0, 0, 0, 0, 0, 300, 312, 315, 330, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    stages: [
      {},
      {},
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
    ],
    className: "h-[calc(100vh-32px)] md:h-full",
  },
};

export const GameOver: Story = {
  args: {
    currentNumber: 313,
    nextNumber: 679,
    powers: [{}, {}, {}, {}],
    slots: [0, 0, 0, 0, 0, 0, 300, 312, 315, 330, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    stages: [
      {},
      {},
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
    ],
    className: "h-[calc(100vh-32px)] md:h-full",
  },
};
