import type { Meta, StoryObj } from "@storybook/react-vite";
import { GovernanceVote } from "./governance-vote";

const meta = {
  title: "Elements/Governance Vote",
  component: GovernanceVote,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    username: {
      control: "text",
      description: "Voter display name",
    },
    choice: {
      control: "select",
      options: ["for", "against", "abstain"],
      description: "Vote choice",
    },
    power: {
      control: "number",
      description: "Voting power",
    },
  },
} satisfies Meta<typeof GovernanceVote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const For: Story = {
  args: {
    username: "mataleone",
    choice: "for",
    power: 1250,
  },
};

export const Against: Story = {
  args: {
    username: "bal7hazar",
    choice: "against",
    power: 830,
  },
};

export const Abstain: Story = {
  args: {
    username: "0x04f3...a7b2",
    choice: "abstain",
    power: 420,
  },
};
