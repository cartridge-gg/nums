import type { Meta, StoryObj } from "@storybook/react-vite";
import { TutorialInstruction } from "./tutorial-instruction";

const meta = {
  title: "Elements/Tutorial Instruction",
  component: TutorialInstruction,
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
    },
    content: {
      control: "text",
    },
    variant: {
      control: "select",
      options: ["default", "ghost"],
    },
  },
} satisfies Meta<typeof TutorialInstruction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "I don’t recognize you...",
    content: "Have you completed the mandatory employee onboarding?",
    className: "max-w-[324px]",
  },
};

export const Ghost: Story = {
  args: {
    title: "...No?",
    content: "Right then, lets start your training.",
    className: "max-w-[324px]",
  },
};
