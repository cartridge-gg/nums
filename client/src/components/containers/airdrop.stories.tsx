import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { Airdrop } from "./airdrop";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Airdrop",
  component: Airdrop,
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
    count: {
      control: "number",
      description: "Number of free games to claim",
    },
    onClaim: {
      action: "claimed",
      description: "Callback when claim button is clicked",
    },
    onClose: {
      action: "closed",
      description: "Callback when close button is clicked",
    },
  },
} satisfies Meta<typeof Airdrop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    onClaim: fn(),
    onClose: fn(),
  },
};

export const SingleGame: Story = {
  args: {
    count: 1,
    onClaim: fn(),
    onClose: fn(),
  },
};
