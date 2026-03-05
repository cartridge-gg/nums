import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingClaimed } from "./staking-claimed";

const meta = {
  title: "Elements/Staking Claimed",
  component: StakingClaimed,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    amount: {
      control: { type: "number" },
      description: "Claimed USDC amount",
    },
    price: {
      control: { type: "number" },
      description: "Price per USDC in USD",
    },
    timestamp: {
      control: { type: "number" },
      description: "Claim timestamp in seconds",
    },
  },
} satisfies Meta<typeof StakingClaimed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    amount: 42.5,
    price: 1,
    timestamp: Math.floor(Date.now() / 1000),
  },
};

export const Empty: Story = {
  args: {
    amount: 0,
    price: 1,
    timestamp: undefined,
  },
};
