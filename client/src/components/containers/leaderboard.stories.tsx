import type { Meta, StoryObj } from "@storybook/react-vite";
import { Leaderboard } from "./leaderboard";

const meta = {
  title: "Containers/Leaderboard",
  component: Leaderboard,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="flex h-full w-full">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Leaderboard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRows = [
  {
    rank: 1,
    username: "clicksave",
    total: 25,
    totalReward: 12500,
    variant: "primary" as const,
  },
  {
    rank: 2,
    username: "bal7hazar",
    total: 312,
    totalReward: 9800,
  },
  {
    rank: 3,
    username: "ashe",
    total: 12,
    totalReward: 7200,
  },
  {
    rank: 4,
    username: "glihm",
    total: 8,
    totalReward: 4100,
  },
  {
    rank: 5,
    username: "flippertherichdolphin",
    total: 10,
    totalReward: 3800,
  },
  {
    rank: 6,
    username: "steebchen",
    total: 124,
    totalReward: 6500,
  },
  {
    rank: 7,
    username: "nasr",
    total: 51,
    totalReward: 5200,
  },
  {
    rank: 8,
    username: "neo",
    total: 13,
    totalReward: 3100,
  },
  {
    rank: 9,
    username: "broody",
    total: 12,
    totalReward: 2900,
  },
  {
    rank: 10,
    username: "tarrence",
    total: 123,
    totalReward: 4800,
  },
  {
    rank: 11,
    username: "mickey",
    total: 321,
    totalReward: 9200,
  },
  {
    rank: 12,
    username: "donald",
    total: 123,
    totalReward: 4500,
  },
  {
    rank: 13,
    username: "goofy",
    total: 123,
    totalReward: 4400,
  },
  {
    rank: 14,
    username: "minnie",
    total: 123,
    totalReward: 4300,
  },
];

export const Default: Story = {
  args: {
    rows: sampleRows,
  },
};

export const Empty: Story = {
  args: {
    rows: [],
  },
};

export const SingleRow: Story = {
  args: {
    rows: [sampleRows[0]],
  },
};
