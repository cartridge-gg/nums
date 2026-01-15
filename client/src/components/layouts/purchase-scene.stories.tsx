import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseScene } from "./purchase-scene";
import { fn } from "storybook/test";

const meta = {
  title: "Layouts/PurchaseScene",
  component: PurchaseScene,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof PurchaseScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleChartValues = [
  0.01, 0.02, 0.04, 0.08, 0.13, 0.19, 0.27, 0.35, 0.45, 0.56, 0.68, 0.82, 0.96,
  1.12, 1.29, 1.47, 1.67, 1.87, 2.09, 2.32,
];

const sampleGames = [
  {
    gameId: "12345",
    maxPayout: "$100",
    onPlay: fn(),
  },
  {
    gameId: "67890",
    score: 150,
    maxPayout: "$250",
    onPlay: fn(),
  },
  {
    gameId: "11111",
    maxPayout: "$50",
    onPlay: fn(),
  },
];

export const Default: Story = {
  args: {
    purchaseProps: {
      chartValues: sampleChartValues,
      chartAbscissa: 10,
      numsPrice: 0.003,
      playPrice: 1.0,
    },
    gamesProps: {
      games: sampleGames,
    },
    onClose: fn(),
  },
};
