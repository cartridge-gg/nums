import type { Meta, StoryObj } from "@storybook/react-vite";
import { GovernanceVotes } from "./governance-votes";

const meta = {
  title: "Containers/Governance Votes",
  component: GovernanceVotes,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    votes: {
      control: "object",
      description: "Array of vote items",
    },
  },
} satisfies Meta<typeof GovernanceVotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    votes: [
      { username: "mataleone", choice: "for", power: 12000 },
      { username: "bal7hazar", choice: "for", power: 8500 },
      { username: "shinobi", choice: "against", power: 3200 },
      { username: "0x04f3...a7b2", choice: "abstain", power: 1500 },
      { username: "clicksave", choice: "for", power: 950 },
      { username: "tarrence", choice: "against", power: 720 },
      { username: "loaf", choice: "for", power: 420 },
    ],
    className: "max-h-[300px]",
  },
};

export const Empty: Story = {
  args: {
    votes: [],
  },
};
