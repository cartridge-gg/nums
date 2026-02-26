import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastThumbnail } from "./toast-thumbnail";

const meta = {
  title: "Elements/Toast Thumbnail",
  component: ToastThumbnail,
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
    type: {
      control: "select",
      options: ["quest", "purchase"],
      description: "The type of the thumbnail",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The size of the thumbnail",
    },
    src: {
      control: "text",
      description: "The image source URL",
    },
    alt: {
      control: "text",
      description: "The alt text for the image",
    },
  },
} satisfies Meta<typeof ToastThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Quest: Story = {
  args: {
    type: "quest",
  },
};

export const Purchase: Story = {
  args: {
    type: "purchase",
  },
};

export const Copy: Story = {
  args: {
    type: "copy",
  },
};
