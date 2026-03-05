import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakingInfo } from "./staking-info";

const meta = {
  title: "Elements/Staking Info",
  component: StakingInfo,
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
      description: "Info message displayed next to the asterisk icon",
    },
  },
} satisfies Meta<typeof StakingInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
