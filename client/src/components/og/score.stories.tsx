import type { Meta, StoryObj } from "@storybook/react-vite";
import { Score } from "./score";

const meta = {
  title: "OG/Score",
  component: Score,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Score>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { score: 17 },
};
