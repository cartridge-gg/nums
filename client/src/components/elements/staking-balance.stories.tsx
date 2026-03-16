import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingBalance } from "./staking-balance";

const meta = {
  title: "Elements/Staking Balance",
  component: StakingBalance,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    stakedAmount: {
      control: { type: "number" },
      description: "Staked NUMS amount",
    },
    totalShare: {
      control: { type: "number" },
      description: "Total share in the vault",
    },
  },
} satisfies Meta<typeof StakingBalance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stakedAmount: 12500,
    totalShare: 25000,
  },
};

export const Contribution: Story = {
  args: {
    title: "You have contributed",
    token: "NUMS",
    stakedAmount: 12500,
    totalShare: 25000,
  },
};

export const Empty: Story = {
  args: {
    stakedAmount: 0,
    totalShare: 0,
  },
};
