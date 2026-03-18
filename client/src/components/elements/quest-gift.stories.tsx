import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestGift } from "./quest-gift";

const meta = {
  title: "Elements/Quest Gift",
  component: QuestGift,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["left", "right"],
    },
    variant: {
      control: "select",
      options: ["default"],
    },
  },
} satisfies Meta<typeof QuestGift>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ArrowRight: Story = {
  args: {
    direction: "right",
    variant: "default",
  },
};

export const ArrowLeft: Story = {
  args: {
    direction: "left",
    variant: "default",
  },
};
