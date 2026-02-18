import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakeState } from "./stake-state";

const meta = {
  title: "Elements/Stake State",
  component: StakeState,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "completed"],
    },
  },
} satisfies Meta<typeof StakeState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    completed: false,
  },
};

export const Completed: Story = {
  args: {
    completed: true,
  },
};
