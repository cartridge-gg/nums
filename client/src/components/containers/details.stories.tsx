import type { Meta, StoryObj } from "@storybook/react-vite";
import { Details } from "./details";

const meta = {
  title: "Containers/Details",
  component: Details,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Details>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    basePrice: 2.0,
    entryPrice: 1.98,
    multiplier: 2,
    breakEven: "14",
    expiration: "24hrs",
    maxPayout: "29,000 NUMS ~ $25.12",
  },
};
