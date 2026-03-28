import type { Meta, StoryObj } from "@storybook/react-vite";
import { GovernanceResults } from "./governance-results";

const meta = {
  title: "Containers/Governance Results",
  component: GovernanceResults,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    forCount: {
      control: "number",
      description: "Number of votes for",
    },
    againstCount: {
      control: "number",
      description: "Number of votes against",
    },
    abstainCount: {
      control: "number",
      description: "Number of votes abstain",
    },
  },
} satisfies Meta<typeof GovernanceResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    forCount: 16000,
    againstCount: 12000,
    abstainCount: 410,
  },
};
