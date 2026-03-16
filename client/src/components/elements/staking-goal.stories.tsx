import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingGoal } from "./staking-goal";

const meta = {
  title: "Elements/Staking Goal",
  component: StakingGoal,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    totalStaked: {
      control: { type: "number" },
      description: "Total staked amount",
    },
    totalShares: {
      control: { type: "number" },
      description: "Total shares target",
    },
  },
} satisfies Meta<typeof StakingGoal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalStaked: 7500,
    totalShares: 10000,
  },
};

export const Empty: Story = {
  args: {
    totalStaked: 0,
    totalShares: 10000,
  },
};

export const Full: Story = {
  args: {
    totalStaked: 10000,
    totalShares: 10000,
  },
};
