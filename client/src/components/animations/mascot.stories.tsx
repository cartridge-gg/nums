import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mascot } from "./mascot";

const meta = {
  title: "Animations/Mascot",
  component: Mascot,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: [
        "4xs",
        "3xs",
        "2xs",
        "xs",
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
        "7xl",
        "3xl",
        "9xl",
        "10xl",
      ],
    },
    fps: {
      control: { type: "range", min: 1, max: 30, step: 1 },
    },
    playing: {
      control: "boolean",
    },
    flipped: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Mascot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "3xl",
    fps: 6,
    playing: true,
    flipped: false,
  },
};

export const Flip: Story = {
  args: {
    size: "3xl",
    fps: 6,
    playing: true,
    flipped: true,
  },
};

export const Subset: Story = {
  args: {
    size: "3xl",
    fps: 6,
    playing: true,
    flipped: false,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
};
