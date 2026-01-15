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
    score: 1250.5,
  },
};

export const Primary: Story = {
  args: {
    rank: 5,
    username: "MyUsername",
    total: 28,
    score: 980.3,
    variant: "primary",
  },
};

export const LongUsername: Story = {
  args: {
    rank: 10,
    username: "VeryLongUsernameThatShouldBeTruncated",
    total: 15,
    score: 750.8,
  },
};
