import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferralPayments } from "./referral-payments";

const now = Math.floor(Date.now() / 1000);

const meta = {
  title: "Containers/Referral Payments",
  component: ReferralPayments,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    payments: {
      control: "object",
      description: "Array of payment items",
    },
  },
} satisfies Meta<typeof ReferralPayments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    payments: [
      { username: "mataleone", amount: "0.10 USDC", timestamp: now - 3600 },
      { username: "shinobi", amount: "0.10 USDC", timestamp: now - 7200 },
      {
        username: "bal7hazar",
        amount: "20 NUMS",
        timestamp: now - 2 * 24 * 3600,
      },
      {
        username: "mataleone",
        amount: "0.10 USDC",
        timestamp: now - 3 * 24 * 3600,
      },
      {
        username: "mataleone",
        amount: "0.10 USDC",
        timestamp: now - 4 * 24 * 3600,
      },
      {
        username: "bal7hazar",
        amount: "20 NUMS",
        timestamp: now - 5 * 24 * 3600,
      },
      {
        username: "mataleone",
        amount: "0.10 USDC",
        timestamp: now - 6 * 24 * 3600,
      },
    ],
    className: "max-h-[300px]",
  },
};

export const WithNotifications: Story = {
  args: {
    payments: [
      { username: "mataleone", amount: "0.10 USDC", timestamp: now - 60 },
      { username: "shinobi", amount: "0.10 USDC", timestamp: now - 120 },
      {
        username: "bal7hazar",
        amount: "20 NUMS",
        timestamp: now - 2 * 24 * 3600,
      },
      {
        username: "mataleone",
        amount: "0.10 USDC",
        timestamp: now - 3 * 24 * 3600,
      },
    ],
    newPaymentCount: 2,
    className: "max-h-[300px]",
  },
};

export const Empty: Story = {
  args: {
    payments: [],
  },
};
