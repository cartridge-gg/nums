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

const CELLS = [
  null,
  false,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
  true,
  false,
  null,
];

export const Default: Story = {
  args: {
    activities: [
      // Today (5 activities)
      {
        gameId: "#1144",
        payout: "+$0.72",
        to: "/game/1144",
        claimed: false,
        timestamp: today,
        cells: CELLS,
      },
      {
        gameId: "#1145",
        payout: "+$1.25",
        to: "/game/1145",
        claimed: true,
        timestamp: today - 1800, // 30 minutes ago
        cells: CELLS,
      },
      {
        gameId: "#1146",
        payout: "+$0.40",
        to: "/game/1146",
        claimed: true,
        timestamp: today - 3600, // 1 hour ago
        cells: CELLS,
      },
      {
        gameId: "#1147",
        payout: "+$1.50",
        to: "/game/1147",
        claimed: true,
        timestamp: today - 7200, // 2 hours ago
        cells: CELLS,
      },
      {
        gameId: "#1148",
        payout: "+$0.60",
        to: "/game/1148",
        claimed: true,
        timestamp: today - 10800, // 3 hours ago
        cells: CELLS,
      },
      // Yesterday (4 activities)
      {
        gameId: "#1149",
        payout: "+$0.90",
        to: "/game/1149",
        claimed: true,
        timestamp: yesterday,
        cells: CELLS,
      },
      {
        gameId: "#1150",
        payout: "+$1.10",
        to: "/game/1150",
        claimed: true,
        timestamp: yesterday - 3600, // Yesterday, 1 hour earlier
        cells: CELLS,
      },
      {
        gameId: "#1151",
        payout: "+$0.80",
        to: "/game/1151",
        claimed: true,
        timestamp: yesterday - 7200, // Yesterday, 2 hours earlier
        cells: CELLS,
      },
      {
        gameId: "#1152",
        payout: "+$1.00",
        to: "/game/1152",
        claimed: true,
        timestamp: yesterday - 10800, // Yesterday, 3 hours earlier
        cells: CELLS,
      },
      // 2 days ago (3 activities)
      {
        gameId: "#1153",
        payout: "+$0.75",
        to: "/game/1153",
        claimed: true,
        timestamp: twoDaysAgo,
        cells: CELLS,
      },
      {
        gameId: "#1154",
        payout: "+$1.40",
        to: "/game/1154",
        claimed: true,
        timestamp: twoDaysAgo - 3600,
        cells: CELLS,
      },
      {
        gameId: "#1155",
        payout: "+$0.50",
        to: "/game/1155",
        claimed: true,
        timestamp: twoDaysAgo - 7200,
        cells: CELLS,
      },
      // 3 days ago (2 activities)
      {
        gameId: "#1156",
        payout: "+$1.20",
        to: "/game/1156",
        claimed: true,
        timestamp: twoDaysAgo - 24 * 60 * 60,
        cells: CELLS,
      },
      {
        gameId: "#1157",
        payout: "+$0.95",
        to: "/game/1157",
        claimed: true,
        timestamp: twoDaysAgo - 24 * 60 * 60 - 3600,
        cells: CELLS,
      },
      // 4 days ago (2 activities)
      {
        gameId: "#1158",
        payout: "+$1.35",
        to: "/game/1158",
        claimed: true,
        timestamp: twoDaysAgo - 2 * 24 * 60 * 60,
        cells: CELLS,
      },
      {
        gameId: "#1159",
        payout: "+$0.65",
        to: "/game/1159",
        claimed: true,
        timestamp: twoDaysAgo - 2 * 24 * 60 * 60 - 3600,
        cells: CELLS,
      },
      // Week ago (4 activities)
      {
        gameId: "#1160",
        payout: "+$1.05",
        to: "/game/1160",
        claimed: true,
        timestamp: weekAgo,
        cells: CELLS,
      },
      {
        gameId: "#1161",
        payout: "+$0.85",
        to: "/game/1161",
        claimed: true,
        timestamp: weekAgo - 3600,
        cells: CELLS,
      },
      {
        gameId: "#1162",
        payout: "+$1.30",
        to: "/game/1162",
        claimed: true,
        timestamp: weekAgo - 7200,
        cells: CELLS,
      },
      {
        gameId: "#1163",
        payout: "+$0.55",
        to: "/game/1163",
        claimed: true,
        timestamp: weekAgo - 10800,
        cells: CELLS,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
};
