import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MediaContent } from "./media-content";

const meta = {
  title: "Elements/Media Content",
  component: MediaContent,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Header title",
    },
  },
} satisfies Meta<typeof MediaContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Human Resources",
    items: [
      <div key="1" className="h-full w-full bg-purple-800" />,
      <div key="2" className="h-full w-full bg-mauve-800" />,
      <div key="3" className="h-full w-full bg-green-800" />,
    ],
    onClose: fn(),
  },
};
