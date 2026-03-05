import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingYield } from "./staking-yield";

const meta = {
  title: "Elements/Staking Yield",
  component: StakingYield,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    value: {
      control: { type: "number", step: 0.1 },
      description: "APR yield value in percent, undefined displays TBD",
    },
  },
} satisfies Meta<typeof StakingYield>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 12.5,
  },
};

export const TBD: Story = {
  args: {
    value: undefined,
  },
};
