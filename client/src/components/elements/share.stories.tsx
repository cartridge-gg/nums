import type { Meta, StoryObj } from "@storybook/react-vite";
import { Share } from "./share";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Share",
  component: Share,
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
  },
} satisfies Meta<typeof Share>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCopyLink: fn(),
    onShareOnX: fn(),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
