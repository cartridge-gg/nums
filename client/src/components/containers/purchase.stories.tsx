import type { Meta, StoryObj } from "@storybook/react-vite";
import { Purchase } from "./purchase";

const meta = {
  title: "Containers/Purchase",
  component: Purchase,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Purchase>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleValues = [
  0.01, 0.02, 0.04, 0.08, 0.13, 0.19, 0.27, 0.35, 0.45, 0.56, 0.68, 0.82, 0.96,
  1.12, 1.29, 1.47, 1.67, 1.87, 2.09, 2.32,
];

export const Default: Story = {
  args: {
    chartValues: sampleValues,
    chartAbscissa: 14,
    numsPrice: 0.003,
  },
};
