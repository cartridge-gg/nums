import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingVault } from "./staking-vault";

const meta = {
  title: "Elements/Staking Vault",
  component: StakingVault,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    vaultAmount: {
      control: { type: "number" },
      description: "Vault USDC amount",
    },
    usdcPrice: {
      control: { type: "number", step: 0.0001 },
      description: "Price per USDC token in USD",
    },
  },
} satisfies Meta<typeof StakingVault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    vaultAmount: 42.5,
    usdcPrice: 1,
  },
};

export const Empty: Story = {
  args: {
    vaultAmount: 0,
    usdcPrice: 1,
  },
};
