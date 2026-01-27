import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activities } from "./activities";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Containers/Activities",
  component: Activities,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="flex h-full w-full">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Activities>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const today = now;
const yesterday = now - 24 * 60 * 60;
const twoDaysAgo = now - 2 * 24 * 60 * 60;
const weekAgo = now - 7 * 24 * 60 * 60;

export const Default: Story = {
  args: {
    activities: [
      // Today (5 activities)
      {
        gameId: 1144,
        score: 14,
        payout: "+$0.72",
        to: "/game?id=1144",
        timestamp: today,
      },
      {
        gameId: 1145,
        score: 25,
        payout: "+$1.25",
        to: "/game?id=1145",
        timestamp: today - 1800, // 30 minutes ago
      },
      {
        gameId: 1146,
        score: 8,
        payout: "+$0.40",
        to: "/game?id=1146",
        timestamp: today - 3600, // 1 hour ago
      },
      {
        gameId: 1147,
        score: 30,
        payout: "+$1.50",
        to: "/game?id=1147",
        timestamp: today - 7200, // 2 hours ago
      },
      {
        gameId: 1148,
        score: 12,
        payout: "+$0.60",
        to: "/game?id=1148",
        timestamp: today - 10800, // 3 hours ago
      },
      // Yesterday (4 activities)
      {
        gameId: 1149,
        score: 18,
        payout: "+$0.90",
        to: "/game?id=1149",
        timestamp: yesterday,
      },
      {
        gameId: 1150,
        score: 22,
        payout: "+$1.10",
        to: "/game?id=1150",
        timestamp: yesterday - 3600, // Yesterday, 1 hour earlier
      },
      {
        gameId: 1151,
        score: 16,
        payout: "+$0.80",
        to: "/game?id=1151",
        timestamp: yesterday - 7200, // Yesterday, 2 hours earlier
      },
      {
        gameId: 1152,
        score: 20,
        payout: "+$1.00",
        to: "/game?id=1152",
        timestamp: yesterday - 10800, // Yesterday, 3 hours earlier
      },
      // 2 days ago (3 activities)
      {
        gameId: 1153,
        score: 15,
        payout: "+$0.75",
        to: "/game?id=1153",
        timestamp: twoDaysAgo,
      },
      {
        gameId: 1154,
        score: 28,
        payout: "+$1.40",
        to: "/game?id=1154",
        timestamp: twoDaysAgo - 3600,
      },
      {
        gameId: 1155,
        score: 10,
        payout: "+$0.50",
        to: "/game?id=1155",
        timestamp: twoDaysAgo - 7200,
      },
      // 3 days ago (2 activities)
      {
        gameId: 1156,
        score: 24,
        payout: "+$1.20",
        to: "/game?id=1156",
        timestamp: twoDaysAgo - 24 * 60 * 60,
      },
      {
        gameId: 1157,
        score: 19,
        payout: "+$0.95",
        to: "/game?id=1157",
        timestamp: twoDaysAgo - 24 * 60 * 60 - 3600,
      },
      // 4 days ago (2 activities)
      {
        gameId: 1158,
        score: 27,
        payout: "+$1.35",
        to: "/game?id=1158",
        timestamp: twoDaysAgo - 2 * 24 * 60 * 60,
      },
      {
        gameId: 1159,
        score: 13,
        payout: "+$0.65",
        to: "/game?id=1159",
        timestamp: twoDaysAgo - 2 * 24 * 60 * 60 - 3600,
      },
      // Week ago (4 activities)
      {
        gameId: 1160,
        score: 21,
        payout: "+$1.05",
        to: "/game?id=1160",
        timestamp: weekAgo,
      },
      {
        gameId: 1161,
        score: 17,
        payout: "+$0.85",
        to: "/game?id=1161",
        timestamp: weekAgo - 3600,
      },
      {
        gameId: 1162,
        score: 26,
        payout: "+$1.30",
        to: "/game?id=1162",
        timestamp: weekAgo - 7200,
      },
      {
        gameId: 1163,
        score: 11,
        payout: "+$0.55",
        to: "/game?id=1163",
        timestamp: weekAgo - 10800,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
};
