import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeScene } from "./home-scene";
import { fn } from "storybook/test";

const meta = {
  title: "Layouts/Home Scene",
  component: HomeScene,
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
} satisfies Meta<typeof HomeScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleQuests = [
  {
    title: "Claim a game",
    task: "Start and play 3 games",
    count: 3,
    total: 3,
    claimed: false,
    expiration: 0,
    onClaim: fn(),
  },
  {
    title: "Coin Collector",
    task: "Earn 2K Nums cumulated while playing",
    count: 240,
    total: 2000,
    claimed: false,
    expiration: new Date().getTime() / 1000 + 12 * 3600 + 24 * 60,
    onClaim: fn(),
  },
  {
    title: "Halfway Hero",
    task: "Fill 10 slots within a single game",
    count: 1,
    total: 1,
    claimed: true,
    expiration: 0,
    onClaim: fn(),
  },
];

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
];

export const Default: Story = {
  args: {
    quests: sampleQuests,
    questsExpiration: new Date().getTime() / 1000 + 12 * 3600 + 24 * 60,
    leaderboardRows: sampleRows,
    totalGames: "241",
    avgScore: "14.3",
  },
};
