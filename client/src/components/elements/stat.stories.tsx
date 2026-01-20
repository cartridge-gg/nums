import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stat } from "./stat";

const meta = {
  title: "Elements/Stat",
  component: Stat,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "The title text",
    },
    content: {
      control: "text",
      description: "The content text",
    },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Score: Story = {
  args: {
    title: "score",
    content: "14",
  },
};

export const Earned: Story = {
  args: {
    title: "earned",
    content: "29,000 Nums ~ $2.12",
  },
};
