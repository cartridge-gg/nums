import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reward } from "./reward";

const meta = {
  title: "OG/Reward",
  component: Reward,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Reward>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { reward: 50000 },
};
