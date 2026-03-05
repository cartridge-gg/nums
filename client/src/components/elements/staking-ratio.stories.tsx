import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingRatio } from "./staking-ratio";

const meta = {
  title: "Elements/Staking Ratio",
  component: StakingRatio,
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
      control: { type: "number", step: 0.0001 },
      description: "Ratio value (1 NUMS = value vNUMS), undefined displays TBD",
    },
  },
} satisfies Meta<typeof StakingRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1.05,
  },
};

export const TBD: Story = {
  args: {
    value: undefined,
  },
};
