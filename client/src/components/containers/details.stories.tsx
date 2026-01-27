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
    entryFee: "$1.00",
    breakEven: "14",
    maxPayout: "29,000 NUMS ~ $25.12",
  },
};
