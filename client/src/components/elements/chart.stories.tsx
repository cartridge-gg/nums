import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chart } from "./chart";

const meta = {
  title: "Elements/Chart",
  component: Chart,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    values: {
      control: "object",
      description: "Array of exactly 20 values",
    },
    abscissa: {
      control: "number",
      min: 0,
      max: 18,
      description:
        "The x-coordinate for the reference lines (between 0 and 20)",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
  args: {
    values: [
      0.04, 0.08, 0.13, 0.19, 0.27, 0.35, 0.45, 0.56, 0.68, 0.82, 0.96, 1.12,
      1.29, 1.47, 1.67, 1.87, 2.09, 2.32,
    ],
    abscissa: 14,
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[372px] h-[240px]">
      <Chart {...args} />
    </div>
  ),
};
