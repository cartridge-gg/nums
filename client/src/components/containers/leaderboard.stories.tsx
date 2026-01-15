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
    score: 13.3,
    variant: "primary" as const,
  },
  {
    rank: 2,
    username: "bal7hazar",
    total: 312,
    score: 13.1,
  },
  {
    rank: 3,
    username: "ashe",
    total: 12,
    score: 14.6,
  },
  {
    rank: 4,
    username: "glihm",
    total: 8,
    score: 12.8,
  },
  {
    rank: 5,
    username: "flippertherichdolphin",
    total: 10,
    score: 11.3,
  },
  {
    rank: 6,
    username: "steebchen",
    total: 124,
    score: 10.7,
  },
  {
    rank: 7,
    username: "nasr",
    total: 51,
    score: 10.4,
  },
  {
    rank: 8,
    username: "neo",
    total: 13,
    score: 10.2,
  },
  {
    rank: 9,
    username: "broody",
    total: 12,
    score: 10.1,
  },
  {
    rank: 10,
    username: "tarrence",
    total: 123,
    score: 9.9,
  },
  {
    rank: 11,
    username: "mickey",
    total: 321,
    score: 8.9,
  },
];

export const Default: Story = {
  args: {
    rows: sampleRows,
    className: "grow",
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
