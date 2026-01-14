import type { Meta, StoryObj } from "@storybook/react-vite";
import { Quest } from "./quest";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Quest",
  component: Quest,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Quest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: {
    title: "Claim a game",
    task: "Start and play 3 games",
    count: 3,
    total: 3,
    claimed: false,
    expiration: 0,
    onClaim: fn(),
  },
};

export const Progress: Story = {
  args: {
    title: "Coin Collector",
    task: "Earn 2K Nums cumulated while playing",
    count: 240,
    total: 2000,
    claimed: false,
    expiration: new Date().getTime() / 1000 + 12 * 3600 + 24 * 60,
    onClaim: fn(),
  },
};

export const Claimed: Story = {
  args: {
    title: "Halfway Hero",
    task: "Fill 10 slots within a single game",
    count: 1,
    total: 1,
    claimed: true,
    expiration: 0,
    onClaim: fn(),
  },
};

export const Empty: Story = {
  args: {
    title: "Coin Collector",
    task: "Earn 2K Nums cumulated while playing",
    count: 0,
    total: 2000,
    claimed: false,
    expiration: 0,
    onClaim: fn(),
  },
};
