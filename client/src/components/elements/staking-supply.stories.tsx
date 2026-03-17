import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingSupply } from "./staking-supply";

const meta = {
  title: "Elements/Staking Supply",
  component: StakingSupply,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Label displayed before the value",
    },
    totalShares: {
      control: { type: "number" },
      description: "Total shares — shows TBD when undefined",
    },
  },
} satisfies Meta<typeof StakingSupply>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalShares: 125000,
  },
};
