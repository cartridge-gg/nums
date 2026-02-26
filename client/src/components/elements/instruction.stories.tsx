import type { Meta, StoryObj } from "@storybook/react-vite";
import { Instruction } from "./instruction";

const meta = {
  title: "Elements/Instruction",
  component: Instruction,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    content: {
      control: "text",
      description: "The instruction text content",
    },
    variant: {
      control: "select",
      options: ["default", "destructive"],
      description: "The visual variant of the instruction",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size of the instruction",
    },
  },
} satisfies Meta<typeof Instruction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "Set Tile",
  },
};

export const Highlighted: Story = {
  args: {
    content: "Set Tile",
  },
};

export const Destructive: Story = {
  args: {
    content: "Game Over",
    variant: "destructive",
  },
};
