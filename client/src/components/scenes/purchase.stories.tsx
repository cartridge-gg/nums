import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseScene } from "./purchase";
import { fn } from "storybook/test";

const meta = {
  title: "Scenes/Purchase",
  component: PurchaseScene,
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
} satisfies Meta<typeof PurchaseScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    slotCount: 18,
    playPrice: 1.99,
    numsPrice: 0.00005,
    multiplier: "1.0x",
    targetSupply: 1000000000000000000000n,
    currentSupply: 1000000000000000000000n,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const Connect: Story = {
  args: {
    slotCount: 18,
    playPrice: 1.99,
    numsPrice: 0.003,
    multiplier: "2.2x",
    targetSupply: 1000000000000000000000n,
    currentSupply: 500000000000000000000n,
    onClose: fn(),
    onConnect: fn(),
    onPurchase: fn(),
  },
};

export const WithExpiration: Story = {
  args: {
    slotCount: 18,
    playPrice: 1.99,
    numsPrice: 0.003,
    multiplier: "1.0x",
    expiration: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
    targetSupply: 1000000000000000000000n,
    currentSupply: 500000000000000000000n,
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const Empty: Story = {
  args: {
    slotCount: 18,
    playPrice: 1.99,
    numsPrice: 0.003,
    multiplier: "1.0x",
    targetSupply: 1000000000000000000000n,
    currentSupply: 500000000000000000000n,
    onClose: fn(),
  },
};
