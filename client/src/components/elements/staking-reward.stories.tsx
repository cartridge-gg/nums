import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingReward } from "./staking-reward";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Staking Reward",
  component: StakingReward,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    rewardAmount: {
      control: { type: "number" },
      description: "Claimable USDC reward amount",
    },
    usdcPrice: {
      control: { type: "number", step: 0.0001 },
      description: "Price per USDC token in USD",
    },
  },
} satisfies Meta<typeof StakingReward>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rewardAmount: 42.5,
    usdcPrice: 1,
    onClaim: fn(),
  },
};

export const Empty: Story = {
  args: {
    rewardAmount: 0,
    usdcPrice: 1,
  },
};
