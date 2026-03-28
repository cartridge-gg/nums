import type { Meta, StoryObj } from "@storybook/react-vite";
import { GovernanceResult } from "./governance-result";

const meta = {
  title: "Elements/Governance Result",
  component: GovernanceResult,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    choice: {
      control: "select",
      options: ["for", "against", "abstain"],
      description: "Vote choice",
    },
    count: {
      control: "number",
      description: "Number of votes for this choice",
    },
    total: {
      control: "number",
      description: "Total number of votes across all choices",
    },
  },
} satisfies Meta<typeof GovernanceResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const For: Story = {
  args: {
    choice: "for",
    count: 8500,
    total: 12000,
  },
};

export const Against: Story = {
  args: {
    choice: "against",
    count: 2300,
    total: 12000,
  },
};

export const Abstain: Story = {
  args: {
    choice: "abstain",
    count: 1200,
    total: 12000,
  },
};
