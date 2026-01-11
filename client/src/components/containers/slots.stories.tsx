import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slots } from "./slots";

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
    number: 262,
    slots: [0, 0, 0, 0, 0, 0, 300, 312, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

export const Valid: Story = {
  args: {
    number: 812,
    slots: [
      1, 0, 31, 189, 198, 262, 300, 312, 0, 425, 551, 0, 0, 629, 0, 0, 722, 743,
      0, 903,
    ],
  },
};

export const Invalid: Story = {
  args: {
    number: 812,
    slots: [
      1, 0, 31, 189, 198, 262, 300, 312, 0, 425, 551, 0, 0, 629, 0, 0, 722, 903,
      903, 903,
    ],
  },
};
