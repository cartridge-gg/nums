import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameRow } from "./game-row";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/GameRow",
  component: GameRow,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof GameRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: "12345",
    maxPayout: "$100",
    onPlay: fn(),
  },
};

export const Continue: Story = {
  args: {
    gameId: "67890",
    score: 150,
    maxPayout: "$250",
    onPlay: fn(),
  },
};
