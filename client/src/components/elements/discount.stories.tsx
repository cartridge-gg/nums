import type { Meta, StoryObj } from "@storybook/react-vite";
import { Discount } from "./discount";

const meta = {
  title: "Elements/Discount",
  component: Discount,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    label: {
      control: "text",
      description: "The label text to display",
    },
  },
} satisfies Meta<typeof Discount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "-3%",
  },
};

export const Large: Story = {
  args: {
    label: "-10%",
  },
};
