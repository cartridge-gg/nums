import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReferralScene } from "./referral";

const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

const meta = {
  title: "Scenes/Referral",
  component: ReferralScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof ReferralScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-full",
    link: "https://nums.gg/?ref=mataleone",
    onClose: fn(),
    payments: [
      {
        username: "mataleone",
        recipient: "0x123",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(0),
      },
      {
        username: "shinobi",
        recipient: "0x456",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(1),
      },
      {
        username: "bal7hazar",
        recipient: "0x789",
        payment_token: "0x789",
        amount: 20,
        referrer: "0xabc",
        executed_at: daysAgo(2),
      },
      {
        username: "mataleone",
        recipient: "0x123",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(3),
      },
      {
        username: "mataleone",
        recipient: "0x123",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(5),
      },
      {
        username: "bal7hazar",
        recipient: "0x789",
        payment_token: "0x789",
        amount: 20,
        referrer: "0xabc",
        executed_at: daysAgo(7),
      },
      {
        username: "mataleone",
        recipient: "0x123",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(10),
      },
      {
        username: "mataleone",
        recipient: "0x123",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(5),
      },
      {
        username: "bal7hazar",
        recipient: "0x789",
        payment_token: "0x789",
        amount: 20,
        referrer: "0xabc",
        executed_at: daysAgo(7),
      },
      {
        username: "mataleone",
        recipient: "0x123",
        payment_token: "0x456",
        amount: 0.1,
        referrer: "0xabc",
        executed_at: daysAgo(10),
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    className: "w-full",
    link: "https://nums.gg/?ref=mataleone",
    onClose: fn(),
    payments: [],
  },
};
