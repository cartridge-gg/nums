import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GovernanceCard } from "./governance-card";

const meta = {
  title: "Elements/Governance Card",
  component: GovernanceCard,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="w-[416px]">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    index: {
      control: "number",
      description: "Proposal index",
    },
    content: {
      control: "text",
      description: "Proposal description",
    },
    to: {
      control: "text",
      description: "External link URL",
    },
    locked: {
      control: "boolean",
      description: "Whether the proposal is locked",
    },
    accepted: {
      control: "boolean",
      description: "Whether the proposal has been accepted",
    },
    rejected: {
      control: "boolean",
      description: "Whether the proposal has been rejected",
    },
  },
} satisfies Meta<typeof GovernanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Locked: Story = {
  args: {
    index: 2,
    content:
      "Increase the token supply cap from 1,000,000 to 2,000,000 NUMS to support ecosystem growth.",
    to: "https://docs.nums.gg/governance",
    locked: true,
  },
};

export const Accepted: Story = {
  args: {
    index: 1,
    content:
      "Allocate 5% of protocol fees to the community treasury for future development grants.",
    to: "https://docs.nums.gg/governance",
    accepted: true,
  },
};

export const Rejected: Story = {
  args: {
    index: 3,
    content: "Reduce staking reward multiplier from 2x to 1.5x.",
    to: "https://docs.nums.gg/governance",
    rejected: true,
  },
};

export const Default: Story = {
  args: {
    index: 4,
    content:
      "Add a new referral tier with bonus rewards for top referrers each month.",
    to: "https://docs.nums.gg/governance",
  },
};
