import type { Meta, StoryObj } from "@storybook/react-vite";
import { Close } from "./close";

const meta = {
  title: "Elements/Close",
  component: Close,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["md", "lg"],
      description: "Button size",
    },
  },
} satisfies Meta<typeof Close>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Lg: Story = {
  args: {
    size: "lg",
  },
};
