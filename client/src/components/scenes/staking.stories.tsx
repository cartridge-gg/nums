import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useRef } from "react";
import { fn } from "storybook/test";
import { StakingScene, type StakingSceneProps } from "./staking";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Scenes/Staking",
  component: StakingScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof StakingScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const RATIO = 1.05;
const DEBOUNCE_DELAY = 500;

const StakingSceneWrapper = (args: Partial<StakingSceneProps>) => {
  const [depositValue, setDepositValue] = useState(0);
  const [mintValue, setMintValue] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [redeemValue, setRedeemValue] = useState(0);
  const [mintLoading, setMintLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);

  const mintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const depositTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const redeemTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const withdrawTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleDepositChange = (value: number) => {
    setDepositValue(value);
    setMintLoading(true);
    clearTimeout(mintTimer.current);
    mintTimer.current = setTimeout(() => {
      setMintValue(value * RATIO);
      setMintLoading(false);
    }, DEBOUNCE_DELAY);
  };

  const handleMintChange = (value: number) => {
    setMintValue(value);
    setDepositLoading(true);
    clearTimeout(depositTimer.current);
    depositTimer.current = setTimeout(() => {
      setDepositValue(value / RATIO);
      setDepositLoading(false);
    }, DEBOUNCE_DELAY);
  };

  const handleWithdrawChange = (value: number) => {
    setWithdrawValue(value);
    setRedeemLoading(true);
    clearTimeout(redeemTimer.current);
    redeemTimer.current = setTimeout(() => {
      setRedeemValue(value / RATIO);
      setRedeemLoading(false);
    }, DEBOUNCE_DELAY);
  };

  const handleRedeemChange = (value: number) => {
    setRedeemValue(value);
    setWithdrawLoading(true);
    clearTimeout(withdrawTimer.current);
    withdrawTimer.current = setTimeout(() => {
      setWithdrawValue(value * RATIO);
      setWithdrawLoading(false);
    }, DEBOUNCE_DELAY);
  };

  return (
    <StakingScene
      {...args}
      className="w-full"
      stakingProps={{
        depositProps: {
          balance: 1000,
          numsPrice: 0.042,
          value: depositValue,
          onValueChange: handleDepositChange,
          loading: depositLoading,
        },
        mintProps: {
          value: mintValue,
          onValueChange: handleMintChange,
          loading: mintLoading,
        },
        withdrawProps: {
          balance: 250,
          numsPrice: 0.042,
          value: withdrawValue,
          onValueChange: handleWithdrawChange,
          loading: withdrawLoading,
        },
        redeemProps: {
          value: redeemValue,
          onValueChange: handleRedeemChange,
          loading: redeemLoading,
        },
        onStake: fn(),
        onUnstake: fn(),
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => (
    <StakingSceneWrapper
      {...args}
      claimedProps={{
        amount: 12.5,
        price: 1,
        timestamp: Math.floor(Date.now() / 1000),
      }}
      balanceProps={{ stakedAmount: 250 }}
      rewardProps={{ rewardAmount: 42.5, usdcPrice: 1, onClaim: fn() }}
      yieldProps={{ value: 12.5 }}
      ratioProps={{ value: 1.05 }}
      onClose={fn()}
    />
  ),
};

export const Locked: Story = {
  render: (args) => (
    <StakingSceneWrapper
      {...args}
      locked
      balanceProps={{ stakedAmount: 250 }}
      rewardProps={{ rewardAmount: 42.5, usdcPrice: 1, onClaim: fn() }}
      yieldProps={{ value: 12.5 }}
      ratioProps={{ value: 1.05 }}
      onClose={fn()}
    />
  ),
};

export const Empty: Story = {
  render: (args) => (
    <StakingSceneWrapper
      {...args}
      balanceProps={{ stakedAmount: 0 }}
      rewardProps={{ rewardAmount: 0, usdcPrice: 1 }}
      yieldProps={{ value: 0 }}
      ratioProps={{ value: 1 }}
      onClose={fn()}
    />
  ),
};
