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
    videos: [
      "/videos/application-accepted.mp4",
      "/videos/sorting-late.mp4",
      "/videos/weclome-back-party.mp4",
      "/videos/welcome-back-balloon.mp4",
    ],
    className: "max-w-[390px]",
    onClose: fn(),
  },
};
