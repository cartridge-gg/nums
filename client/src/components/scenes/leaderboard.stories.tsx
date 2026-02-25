import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardScene } from "./leaderboard";
import { fn } from "storybook/test";
import type { LeaderboardRowData } from "@/hooks/leaderboard";

const meta = {
  title: "Scenes/Leaderboard",
  component: LeaderboardScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof LeaderboardScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRows: LeaderboardRowData[] = [
  {
    username: "clicksave",
    player:
      "0x008b95a26e1392ed9e817607bfae2dd93efb9c66ee7db0b018091a11d9037006",
    games_played: 25,
    games_played_day: 5,
    games_played_week: 12,
    total_reward: 12500,
    total_reward_day: 2500,
    total_reward_week: 6000,
  },
  {
    username: "bal7hazar",
    player:
      "0x1234567890123456789012345678901234567890123456789012345678901234",
    games_played: 312,
    games_played_day: 8,
    games_played_week: 45,
    total_reward: 9800,
    total_reward_day: 800,
    total_reward_week: 3200,
  },
  {
    username: "ashe",
    player:
      "0x2345678901234567890123456789012345678901234567890123456789012345",
    games_played: 12,
    games_played_day: 2,
    games_played_week: 5,
    total_reward: 7200,
    total_reward_day: 1200,
    total_reward_week: 3600,
  },
  {
    username: "glihm",
    player:
      "0x3456789012345678901234567890123456789012345678901234567890123456",
    games_played: 8,
    games_played_day: 0,
    games_played_week: 3,
    total_reward: 4100,
    total_reward_day: null,
    total_reward_week: 1500,
  },
  {
    username: "flippertherichdolphin",
    player:
      "0x4567890123456789012345678901234567890123456789012345678901234567",
    games_played: 10,
    games_played_day: 1,
    games_played_week: 4,
    total_reward: 3800,
    total_reward_day: 380,
    total_reward_week: 1520,
  },
  {
    username: "steebchen",
    player:
      "0x5678901234567890123456789012345678901234567890123456789012345678",
    games_played: 124,
    games_played_day: 15,
    games_played_week: 38,
    total_reward: 6500,
    total_reward_day: 800,
    total_reward_week: 2000,
  },
  {
    username: "nasr",
    player:
      "0x6789012345678901234567890123456789012345678901234567890123456789",
    games_played: 51,
    games_played_day: 3,
    games_played_week: 12,
    total_reward: 5200,
    total_reward_day: 300,
    total_reward_week: 1200,
  },
  {
    username: "neo",
    player:
      "0x7890123456789012345678901234567890123456789012345678901234567890",
    games_played: 13,
    games_played_day: 0,
    games_played_week: 2,
    total_reward: 3100,
    total_reward_day: null,
    total_reward_week: 500,
  },
  {
    username: "broody",
    player:
      "0x8901234567890123456789012345678901234567890123456789012345678901",
    games_played: 12,
    games_played_day: 1,
    games_played_week: 3,
    total_reward: 2900,
    total_reward_day: 250,
    total_reward_week: 750,
  },
  {
    username: "tarrence",
    player:
      "0x9012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    total_reward: 4800,
    total_reward_day: 280,
    total_reward_week: 1000,
  },
  {
    username: "mickey",
    player:
      "0xa012345678901234567890123456789012345678901234567890123456789012",
    games_played: 321,
    games_played_day: 20,
    games_played_week: 78,
    total_reward: 9200,
    total_reward_day: 600,
    total_reward_week: 2400,
  },
  {
    username: "donald",
    player:
      "0xb012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    total_reward: 4500,
    total_reward_day: 260,
    total_reward_week: 950,
  },
  {
    username: "goofy",
    player:
      "0xc012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    total_reward: 4400,
    total_reward_day: 250,
    total_reward_week: 940,
  },
  {
    username: "minnie",
    player:
      "0xd012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    total_reward: 4300,
    total_reward_day: 250,
    total_reward_week: 930,
  },
];

export const Default: Story = {
  args: {
    rows: sampleRows,
    onClose: fn(),
  },
};

export const WithCurrentUser: Story = {
  args: {
    rows: sampleRows,
    currentUserAddress:
      "0x008b95a26e1392ed9e817607bfae2dd93efb9c66ee7db0b018091a11d9037006",
    onClose: fn(),
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    onClose: fn(),
  },
};
