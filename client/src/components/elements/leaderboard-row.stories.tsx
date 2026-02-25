import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardRow } from "./leaderboard-row";

const meta = {
  title: "Elements/LeaderboardRow",
  component: LeaderboardRow,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof LeaderboardRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rank: 1,
    username: "Player123",
    total: 42,
    totalReward: 12500,
  },
};

export const Primary: Story = {
  args: {
    rank: 5,
    username: "MyUsername",
    total: 28,
    totalReward: 8200,
    variant: "primary",
  },
};

export const LongUsername: Story = {
  args: {
    rank: 10,
    username: "VeryLongUsernameThatShouldBeTruncated",
    total: 15,
    totalReward: 5400,
  },
};
