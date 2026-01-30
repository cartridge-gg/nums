import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseScene } from "./purchase-scene";
import { fn } from "storybook/test";

const meta = {
  title: "Layouts/PurchaseScene",
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

const sampleChartValues = [
  0.01, 0.02, 0.04, 0.08, 0.13, 0.19, 0.27, 0.35, 0.45, 0.56, 0.68, 0.82, 0.96,
  1.12, 1.29, 1.47, 1.67, 1.87, 2.09, 2.32,
];

export const Default: Story = {
  args: {
    detailsProps: {
      entryFee: "1.99",
      breakEven: "14",
      maxPayout: "29,000 NUMS ~ $25.12",
    },
    purchaseProps: {
      chartValues: sampleChartValues,
      chartAbscissa: 10,
      numsPrice: 0.003,
    },
    onClose: fn(),
    onConnect: fn(),
    onPurchase: fn(),
  },
};
