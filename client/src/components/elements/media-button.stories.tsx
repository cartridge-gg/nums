import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaButton } from "./media-button";

const meta = {
  title: "Elements/Media Button",
  component: MediaButton,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof MediaButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
