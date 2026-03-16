import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sound } from "./sound";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Sound",
  component: Sound,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "The label displayed above the control",
    },
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current volume value (0-100)",
    },
    muted: {
      control: "boolean",
      description: "Whether the sound is muted",
    },
  },
  args: {
    title: "Music",
    value: 75,
    muted: false,
    onChange: fn(),
    onMute: fn(),
  },
} satisfies Meta<typeof Sound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = {
  args: {
    muted: true,
  },
};

export const Effects: Story = {
  args: {
    title: "Effects",
    value: 50,
  },
};
