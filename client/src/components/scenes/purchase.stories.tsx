import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseScene, type PurchaseSceneProps } from "./purchase";
import { fn } from "storybook/test";
import { useState } from "react";

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
type Story = StoryObj<
  Omit<PurchaseSceneProps, "stakesProps"> & {
    initialStakeIndex?: number;
    stakesTotal?: number;
  }
>;

const PurchaseSceneWrapper = ({
  initialStakeIndex = 1,
  stakesTotal = 10,
  ...args
}: Omit<PurchaseSceneProps, "stakesProps"> & {
  initialStakeIndex?: number;
  stakesTotal?: number;
}) => {
  const [stakeIndex, setStakeIndex] = useState(initialStakeIndex);
  return (
    <PurchaseScene
      {...args}
      stakesProps={{
        total: stakesTotal,
        index: stakeIndex,
        setIndex: setStakeIndex,
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: 18,
    basePrice: 2.0,
    playPrice: 1.99,
    numsPrice: 0.00005,
    multiplier: 1.0,
    targetSupply: 1000000000000000000000n,
    currentSupply: 1000000000000000000000n,
    stakesTotal: 10,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const Connect: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: 18,
    basePrice: 2.0,
    playPrice: 1.99,
    numsPrice: 0.003,
    multiplier: 2.2,
    targetSupply: 1000000000000000000000n,
    currentSupply: 500000000000000000000n,
    stakesTotal: 10,
    className: "w-full",
    onClose: fn(),
    onConnect: fn(),
    onPurchase: fn(),
  },
};

export const WithExpiration: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: 18,
    basePrice: 2.0,
    playPrice: 1.99,
    numsPrice: 0.003,
    multiplier: 1.0,
    expiration: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
    targetSupply: 1000000000000000000000n,
    currentSupply: 500000000000000000000n,
    stakesTotal: 10,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const Empty: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: 18,
    basePrice: 2.0,
    playPrice: 1.99,
    numsPrice: 0.003,
    multiplier: 1.0,
    targetSupply: 1000000000000000000000n,
    currentSupply: 500000000000000000000n,
    stakesTotal: 10,
    className: "w-full",
    onClose: fn(),
  },
};
