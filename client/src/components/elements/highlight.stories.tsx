import type { Meta, StoryObj } from "@storybook/react-vite";
import { Highlight } from "./highlight";

const meta = {
  title: "Elements/Highlight",
  component: Highlight,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Highlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TotalGames: Story = {
  args: {
    title: "Total games",
    content: "241",
  },
};

export const AvgScore: Story = {
  args: {
    title: "avg. score",
    content: "14.3",
  },
};
