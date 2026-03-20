import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pointer } from "./pointer";

const meta = {
  title: "Animations/Pointer",
  component: Pointer,
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
        "8xl",
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
    rotation: {
      control: { type: "range", min: -180, max: 180, step: 1 },
    },
  },
} satisfies Meta<typeof Pointer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "3xl",
    fps: 6,
    playing: true,
    rotation: 0,
    frames: [8, 9, 10, 11, 4, 5, 6, 7, 6, 5, 4, 11, 10, 9],
  },
};
