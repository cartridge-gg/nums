import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastAction } from "./toast-action";
import { BrowserRouter } from "react-router-dom";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Toast Action",
  component: ToastAction,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
  },
} satisfies Meta<typeof ToastAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: "/",
    onClick: fn(),
  },
};
