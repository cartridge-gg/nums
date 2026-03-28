import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GovernanceProposals } from "./governance-proposals";

const meta = {
  title: "Containers/Governance Proposals",
  component: GovernanceProposals,
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
    proposals: {
      control: "object",
      description: "Array of governance card items",
    },
  },
} satisfies Meta<typeof GovernanceProposals>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    proposals: [
      {
        index: 1,
        content:
          "Allocate 5% of protocol fees to the community treasury for future development grants.",
        to: "https://docs.nums.gg/governance",
        locked: true,
      },
      {
        index: 2,
        content:
          "Increase the token supply cap from 1,000,000 to 2,000,000 NUMS to support ecosystem growth.",
        to: "https://docs.nums.gg/governance",
      },
      {
        index: 3,
        content: "Reduce staking reward multiplier from 2x to 1.5x.",
        to: "https://docs.nums.gg/governance",
        accepted: true,
      },
    ],
  },
};

export const Single: Story = {
  args: {
    proposals: [
      {
        index: 1,
        content:
          "Add a new referral tier with bonus rewards for top referrers each month.",
        to: "https://docs.nums.gg/governance",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    proposals: [],
  },
};
