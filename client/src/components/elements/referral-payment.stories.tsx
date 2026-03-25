import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferralPayment } from "./referral-payment";

const meta = {
  title: "Elements/Referral Payment",
  component: ReferralPayment,
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
      description: "Referred user's display name",
    },
    amount: {
      control: "text",
      description: "Payment amount with token symbol",
    },
    timestamp: {
      control: "number",
      description: "Unix timestamp of the payment",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof ReferralPayment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    username: "mataleone",
    amount: "0.10 USDC",
    timestamp: Math.floor(Date.now() / 1000) - 2 * 24 * 3600,
  },
};

export const WithNotification: Story = {
  args: {
    username: "mataleone",
    amount: "0.10 USDC",
    timestamp: Math.floor(Date.now() / 1000) - 60,
    isNew: true,
  },
};
