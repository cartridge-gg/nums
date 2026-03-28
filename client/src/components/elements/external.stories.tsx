import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { External } from "./external";

const meta = {
  title: "Elements/External",
  component: External,
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
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    to: {
      control: "text",
      description: "External link URL",
    },
    label: {
      control: "text",
      description: "Link label text",
    },
  },
} satisfies Meta<typeof External>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: "https://docs.nums.gg/governance/staking",
    label: "Read More",
  },
};

export const FullProposal: Story = {
  args: {
    to: "https://docs.nums.gg/governance",
    label: "Full Proposal",
  },
};
