import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakeAdd, StakeSub } from "./stake-change";

const meta = {
  title: "Elements/Stake Change",
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Add: Story = {
  render: () => <StakeAdd />,
};

export const AddDisabled: Story = {
  render: () => <StakeAdd disabled />,
};

export const Sub: Story = {
  render: () => <StakeSub />,
};

export const SubDisabled: Story = {
  render: () => <StakeSub disabled />,
};
