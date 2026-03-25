import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeScene } from "./home";
import { fn } from "storybook/test";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Scenes/Home",
  component: HomeScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="flex h-screen w-full p-4 md:p-6">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof HomeScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const today = now;
const yesterday = now - 24 * 60 * 60;
const twoDaysAgo = now - 2 * 24 * 60 * 60;
const weekAgo = now - 7 * 24 * 60 * 60;

const sampleGames = [
  {
    gameId: 1144,
    breakEven: "14",
    payout: "$100",
  },
  {
    gameId: 1145,
    breakEven: "18",
    payout: "$150",
  },
  {
    gameId: 1146,
    breakEven: "15",
    payout: "$120",
  },
];

const sampleCells: (boolean | null)[] = [
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

const sampleActivities = [
  // Today (5 activities)
  {
    gameId: "#1144",
    payout: "+$0.72",
    to: "/game/1144",
    timestamp: today,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1145",
    payout: "+$1.25",
    to: "/game/1145",
    timestamp: today - 1800,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1146",
    payout: "+$0.40",
    to: "/game/1146",
    timestamp: today - 3600,
    claimed: false,
    cells: sampleCells,
  },
  {
    gameId: "#1147",
    payout: "+$1.50",
    to: "/game/1147",
    timestamp: today - 7200,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1148",
    payout: "+$0.60",
    to: "/game/1148",
    timestamp: today - 10800,
    claimed: false,
    cells: sampleCells,
  },
  // Yesterday (4 activities)
  {
    gameId: "#1149",
    payout: "+$0.90",
    to: "/game/1149",
    timestamp: yesterday,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1150",
    payout: "+$1.10",
    to: "/game/1150",
    timestamp: yesterday - 3600,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1151",
    payout: "+$0.80",
    to: "/game/1151",
    timestamp: yesterday - 7200,
    claimed: false,
    cells: sampleCells,
  },
  {
    gameId: "#1152",
    payout: "+$1.00",
    to: "/game/1152",
    timestamp: yesterday - 10800,
    claimed: true,
    cells: sampleCells,
  },
  // 2 days ago (3 activities)
  {
    gameId: "#1153",
    payout: "+$0.75",
    to: "/game/1153",
    timestamp: twoDaysAgo,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1154",
    payout: "+$1.40",
    to: "/game/1154",
    timestamp: twoDaysAgo - 3600,
    claimed: false,
    cells: sampleCells,
  },
  {
    gameId: "#1155",
    payout: "+$0.50",
    to: "/game/1155",
    timestamp: twoDaysAgo - 7200,
    claimed: true,
    cells: sampleCells,
  },
  // 3 days ago (2 activities)
  {
    gameId: "#1156",
    payout: "+$1.20",
    to: "/game/1156",
    timestamp: twoDaysAgo - 24 * 60 * 60,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1157",
    payout: "+$0.95",
    to: "/game/1157",
    timestamp: twoDaysAgo - 24 * 60 * 60 - 3600,
    claimed: false,
    cells: sampleCells,
  },
  // Week ago (4 activities)
  {
    gameId: "#1158",
    payout: "+$1.35",
    to: "/game/1158",
    timestamp: weekAgo,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1159",
    payout: "+$0.65",
    to: "/game/1159",
    timestamp: weekAgo - 3600,
    claimed: true,
    cells: sampleCells,
  },
  {
    gameId: "#1160",
    payout: "+$1.05",
    to: "/game/1160",
    timestamp: weekAgo - 7200,
    claimed: false,
    cells: sampleCells,
  },
  {
    gameId: "#1161",
    payout: "+$0.85",
    to: "/game/1161",
    timestamp: weekAgo - 10800,
    claimed: true,
    cells: sampleCells,
  },
];

const Wrapper = (args: Parameters<typeof HomeScene>[0]) => {
  return <HomeScene {...args} />;
};

export const Default: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    gameId: 1144,
    games: { games: sampleGames, gameId: 1144, setGameId: fn() },
    allActivities: { activities: sampleActivities },
    playerActivities: { activities: sampleActivities },
    onPractice: fn(),
    onPurchase: fn(),
  },
};

export const Empty: Story = {
  args: {
    gameId: undefined,
    games: {
      games: [],
      gameId: undefined,
      setGameId: fn(),
    },
    allActivities: {
      activities: [],
    },
    playerActivities: {
      activities: [],
    },
  },
};
