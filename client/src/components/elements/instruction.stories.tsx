import type { Meta, StoryObj } from "@storybook/react-vite";
import { Instruction } from "./instruction";

const meta = {
  title: "Elements/Instruction",
  component: Instruction,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      options: {
        dark: {
          name: "dark",
          value: "#444444",
        },
      },
    },
  },
  argTypes: {
    content: {
      control: "text",
      description: "The instruction text content",
    },
    variant: {
      control: "select",
      options: ["default"],
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
    content: "Set Number",
  },
};
