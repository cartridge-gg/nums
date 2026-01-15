import type { Meta, StoryObj } from "@storybook/react-vite";
import { Play } from "./play";

const meta = {
  title: "Elements/Play",
  component: Play,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Play>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
