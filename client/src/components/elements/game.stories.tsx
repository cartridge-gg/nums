import type { Meta, StoryObj } from "@storybook/react-vite";
import { Game } from "./game";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Game",
  component: Game,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Game>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: "1144",
    score: 10,
    expiration: 1740614400,
    payout: "$100",
    onPlay: fn(),
  },
};

export const New: Story = {
  args: {
    variant: "new",
    gameId: "1144",
    score: 10,
    expiration: 1740614400,
    payout: "$100",
    onPlay: fn(),
  },
};

export const Empty: Story = {
  args: {
    onPlay: fn(),
  },
};
