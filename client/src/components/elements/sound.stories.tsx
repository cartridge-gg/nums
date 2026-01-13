import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sound } from "./sound";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Sound",
  component: Sound,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    isMuted: {
      control: "boolean",
      description: "Whether the sound is muted",
    },
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
    isMuted: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Sound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = {
  args: {
    isMuted: true,
  },
};
