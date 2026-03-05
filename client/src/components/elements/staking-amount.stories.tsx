import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingAmount } from "./staking-amount";

const meta = {
  title: "Elements/Staking Amount",
  component: StakingAmount,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    balance: {
      control: { type: "number" },
      description: "Available NUMS balance",
    },
    numsPrice: {
      control: { type: "number", step: 0.0001 },
      description: "Price per NUMS token in USD",
    },
  },
} satisfies Meta<typeof StakingAmount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<number>(0);
    return (
      <StakingAmount
        balance={12500}
        numsPrice={0.003}
        action="stake"
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const Stake: Story = {
  args: {
    balance: 12500,
    numsPrice: 0.003,
    action: "stake",
  },
};

export const DefaultStake: Story = {
  args: {
    action: "stake",
  },
};

export const Unstake: Story = {
  args: {
    balance: 12500,
    action: "unstake",
  },
};

export const DefaultUnstake: Story = {
  args: {
    action: "unstake",
  },
};
