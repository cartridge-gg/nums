import type { Meta, StoryObj } from "@storybook/react-vite";
import { Games } from "./games";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Games",
  component: Games,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Games>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    games: sampleGames,
  },
};

export const Empty: Story = {
  args: {
    games: [],
  },
};
