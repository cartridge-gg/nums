import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slots } from "./slots";
import { Trap, TrapType } from "@/types/trap";

const meta = {
  title: "Containers/Slots",
  component: Slots,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Slots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    number: 107,
    slots: [
      { value: 1 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Lucky) },
      { value: 0 },
      { value: 0 },
      { value: 262, trap: new Trap(TrapType.Windy), inactive: true },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Magnet) },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Bomb) },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.UFO) },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 999 },
    ],
  },
};

export const Valid: Story = {
  args: {
    number: 812,
    slots: [
      { value: 1 },
      { value: 0 },
      { value: 31 },
      { value: 189 },
      { value: 198 },
      { value: 262 },
      { value: 300 },
      { value: 312 },
      { value: 0 },
      { value: 425 },
      { value: 551 },
      { value: 0 },
      { value: 0 },
      { value: 629 },
      { value: 0 },
      { value: 0 },
      { value: 722 },
      { value: 743 },
      { value: 0 },
      { value: 903 },
    ],
  },
};

export const Invalid: Story = {
  args: {
    number: 812,
    slots: [
      { value: 1 },
      { value: 0 },
      { value: 31 },
      { value: 189 },
      { value: 198 },
      { value: 262 },
      { value: 300 },
      { value: 312 },
      { value: 0 },
      { value: 425 },
      { value: 551 },
      { value: 0 },
      { value: 0 },
      { value: 629 },
      { value: 0 },
      { value: 0 },
      { value: 722 },
      { value: 743 },
      { value: 903 }, // Fill the empty slot
      { value: 903 },
    ],
  },
};
