import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameOver } from "./game-over";
import { fn } from "storybook/test";
import { AudioProvider } from "@/context/audio";

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
        <AudioProvider>
          <Story />
        </AudioProvider>
      </BrowserRouter>
    ),
  ],
  argTypes: {},
} satisfies Meta<typeof GameOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stages: {
      states: [
        { completed: true },
        { completed: true },
        { completed: true },
        { gem: true, completed: true },
        { completed: true },
        { completed: true },
        { completed: true },
        { gem: true, completed: true },
        { completed: true },
        { completed: true },
        { gem: true, completed: true },
        {},
        {},
        {},
        {},
        {},
        {},
        { crown: true },
      ],
    },
    payout: 29000,
    value: 2.123456789,
    score: 15,
    newGameId: 1,
    newGameCount: 5,
    onClaim: fn(),
    onSpecate: fn(),
    onPurchase: fn(),
  },
};

export const Claimed: Story = {
  args: {
    stages: {
      states: [
        { completed: true },
        { completed: true },
        { completed: true },
        { gem: true, completed: true },
        { completed: true },
        { completed: true },
        { completed: true },
        { gem: true, completed: true },
        { completed: true },
        { completed: true },
        { gem: true, completed: true },
        {},
        {},
        {},
        {},
        {},
        {},
        { crown: true },
      ],
    },
    payout: 29000,
    value: 2.123456789,
    score: 15,
    newGameId: 1,
    newGameCount: 5,
    onSpecate: fn(),
    onPurchase: fn(),
  },
};

export const Empty: Story = {
  args: {
    stages: {
      states: [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ],
    },
    payout: 0,
    value: 0,
    score: 0,
    newGameId: 0,
    newGameCount: 0,
    onSpecate: fn(),
    onPurchase: fn(),
  },
};
