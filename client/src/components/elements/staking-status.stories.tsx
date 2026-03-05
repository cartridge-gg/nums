import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingStatus } from "./staking-status";

const meta = {
  title: "Elements/Staking Status",
  component: StakingStatus,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof StakingStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
