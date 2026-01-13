import type { Meta, StoryObj } from "@storybook/react-vite";
import { Balance } from "./balance";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Balance",
  component: Balance,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    balance: {
      control: "text",
      description: "The balance value to display",
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
    balance: "100,200",
    onClick: fn(),
  },
} satisfies Meta<typeof Balance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    balance: "0",
  },
};
