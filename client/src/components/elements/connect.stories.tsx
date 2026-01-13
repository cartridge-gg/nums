import type { Meta, StoryObj } from "@storybook/react-vite";
import { Connect } from "./connect";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Connect",
  component: Connect,
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
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Connect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
