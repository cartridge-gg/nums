import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useRef } from "react";
import { Staking, type StakingProps } from "./staking";

const meta = {
  title: "Containers/Staking",
  component: Staking,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Staking>;

export default meta;
type Story = StoryObj<typeof meta>;

const RATIO = 1.05;
const DEBOUNCE_DELAY = 500;

const StakingWrapper = (args: Partial<StakingProps>) => {
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
    <Staking
      {...args}
      depositProps={{
        balance: 1000,
        numsPrice: 0.042,
        value: depositValue,
        onValueChange: handleDepositChange,
        loading: depositLoading,
      }}
      mintProps={{
        value: mintValue,
        onValueChange: handleMintChange,
        loading: mintLoading,
      }}
      withdrawProps={{
        balance: 250,
        numsPrice: 0.042,
        value: withdrawValue,
        onValueChange: handleWithdrawChange,
        loading: withdrawLoading,
      }}
      redeemProps={{
        value: redeemValue,
        onValueChange: handleRedeemChange,
        loading: redeemLoading,
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <StakingWrapper {...args} />,
};

export const Locked: Story = {
  render: (args) => <StakingWrapper {...args} locked />,
};

export const Empty: Story = {
  render: (args) => (
    <StakingWrapper
      {...args}
      depositProps={{ balance: 0, numsPrice: 0.042 }}
      mintProps={{}}
      withdrawProps={{ balance: 0, numsPrice: 0.042 }}
      redeemProps={{}}
    />
  ),
};
