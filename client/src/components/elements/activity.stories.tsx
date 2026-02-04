import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity } from "./activity";
import { BrowserRouter } from "react-router-dom";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Activity",
  component: Activity,
  parameters: {
    layout: "padded",
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
} satisfies Meta<typeof Activity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: 1144,
    score: 14,
    payout: "+$0.72",
    to: "#",
  },
};

export const Claimable: Story = {
  args: {
    gameId: 1144,
    score: 14,
    payout: "+$0.72",
    to: "#",
    onClaim: fn(),
  },
};
