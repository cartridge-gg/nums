import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingWarning } from "./staking-warning";

const meta = {
  title: "Elements/Staking Warning",
  component: StakingWarning,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    message: {
      control: { type: "text" },
      description: "Warning message displayed next to the locker icon",
    },
  },
} satisfies Meta<typeof StakingWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
