import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardScene } from "./leaderboard-scene";
import { fn } from "storybook/test";
import type { LeaderboardRowData } from "@/hooks/leaderboard";

const meta = {
  title: "Layouts/LeaderboardScene",
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
    average_score: 13.3,
    average_score_day: 14.2,
    average_score_week: 13.8,
  },
  {
    username: "bal7hazar",
    player:
      "0x1234567890123456789012345678901234567890123456789012345678901234",
    games_played: 312,
    games_played_day: 8,
    games_played_week: 45,
    average_score: 13.1,
    average_score_day: 12.5,
    average_score_week: 12.9,
  },
  {
    username: "ashe",
    player:
      "0x2345678901234567890123456789012345678901234567890123456789012345",
    games_played: 12,
    games_played_day: 2,
    games_played_week: 5,
    average_score: 14.6,
    average_score_day: 15.1,
    average_score_week: 14.8,
  },
  {
    username: "glihm",
    player:
      "0x3456789012345678901234567890123456789012345678901234567890123456",
    games_played: 8,
    games_played_day: 0,
    games_played_week: 3,
    average_score: 12.8,
    average_score_day: null,
    average_score_week: 13.2,
  },
  {
    username: "flippertherichdolphin",
    player:
      "0x4567890123456789012345678901234567890123456789012345678901234567",
    games_played: 10,
    games_played_day: 1,
    games_played_week: 4,
    average_score: 11.3,
    average_score_day: 11.5,
    average_score_week: 11.4,
  },
  {
    username: "steebchen",
    player:
      "0x5678901234567890123456789012345678901234567890123456789012345678",
    games_played: 124,
    games_played_day: 15,
    games_played_week: 38,
    average_score: 10.7,
    average_score_day: 10.9,
    average_score_week: 10.8,
  },
  {
    username: "nasr",
    player:
      "0x6789012345678901234567890123456789012345678901234567890123456789",
    games_played: 51,
    games_played_day: 3,
    games_played_week: 12,
    average_score: 10.4,
    average_score_day: 10.6,
    average_score_week: 10.5,
  },
  {
    username: "neo",
    player:
      "0x7890123456789012345678901234567890123456789012345678901234567890",
    games_played: 13,
    games_played_day: 0,
    games_played_week: 2,
    average_score: 10.2,
    average_score_day: null,
    average_score_week: 10.3,
  },
  {
    username: "broody",
    player:
      "0x8901234567890123456789012345678901234567890123456789012345678901",
    games_played: 12,
    games_played_day: 1,
    games_played_week: 3,
    average_score: 10.1,
    average_score_day: 10.2,
    average_score_week: 10.15,
  },
  {
    username: "tarrence",
    player:
      "0x9012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    average_score: 9.9,
    average_score_day: 10.0,
    average_score_week: 9.95,
  },
  {
    username: "mickey",
    player:
      "0xa012345678901234567890123456789012345678901234567890123456789012",
    games_played: 321,
    games_played_day: 20,
    games_played_week: 78,
    average_score: 8.9,
    average_score_day: 9.1,
    average_score_week: 9.0,
  },
  {
    username: "donald",
    player:
      "0xb012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    average_score: 9.9,
    average_score_day: 10.0,
    average_score_week: 9.9,
  },
  {
    username: "goofy",
    player:
      "0xc012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    average_score: 9.9,
    average_score_day: 10.0,
    average_score_week: 9.9,
  },
  {
    username: "minnie",
    player:
      "0xd012345678901234567890123456789012345678901234567890123456789012",
    games_played: 123,
    games_played_day: 7,
    games_played_week: 25,
    average_score: 9.9,
    average_score_day: 10.0,
    average_score_week: 9.9,
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
