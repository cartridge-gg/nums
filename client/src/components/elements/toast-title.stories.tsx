import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastTitle } from "./toast-title";

const meta = {
  title: "Elements/Toast Title",
  component: ToastTitle,
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
    title: {
      control: "text",
      description: "The username to display",
    },
  },
} satisfies Meta<typeof ToastTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Bal7hazar",
  },
};
