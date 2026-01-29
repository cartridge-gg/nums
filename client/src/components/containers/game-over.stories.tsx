import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameOver } from "./game-over";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Game Over",
  component: GameOver,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {},
} satisfies Meta<typeof GameOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    payout: 29000,
    value: 2.123456789,
    score: 15,
    newGameId: 1,
    newGameCount: 5,
    onSpecate: fn(),
    onPlayAgain: fn(),
    onPurchase: fn(),
  },
};

export const Empty: Story = {
  args: {
    payout: 0,
    value: 0,
    score: 0,
    newGameId: 0,
    newGameCount: 0,
    onSpecate: fn(),
    onPlayAgain: fn(),
    onPurchase: fn(),
  },
};
