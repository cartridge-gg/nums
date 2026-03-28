import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BrowserRouter } from "react-router-dom";
import { GovernanceScene } from "./governance";

const meta = {
  title: "Scenes/Governance",
  component: GovernanceScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="flex h-screen w-full p-4 md:p-6">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof GovernanceScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-full",
    onClose: fn(),
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
    results: {
      forCount: 12800,
      againstCount: 990,
      abstainCount: 1080,
    },
    votes: [
      { username: "clicksave", choice: "for", power: 12000 },
      { username: "clicksave", choice: "for", power: 800 },
      { username: "bal7hazar", choice: "against", power: 760 },
      { username: "shinobi", choice: "abstain", power: 600 },
      { username: "shinobi", choice: "abstain", power: 480 },
      { username: "bal7hazar", choice: "against", power: 230 },
      { username: "clicksave", choice: "for", power: 130 },
      { username: "clicksave", choice: "for", power: 120 },
    ],
  },
};

export const Empty: Story = {
  args: {
    className: "w-full",
    onClose: fn(),
    proposals: [],
    results: {
      forCount: 0,
      againstCount: 0,
      abstainCount: 0,
    },
    votes: [],
  },
};
