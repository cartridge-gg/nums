import type { Meta, StoryObj } from "@storybook/react-vite";
import { WelcomeScene } from "./welcome";

const meta = {
  title: "Scenes/Welcome",
  component: WelcomeScene,
  parameters: {
    layout: "fullscreen",
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
    size: {
      control: "select",
      options: ["md"],
      description: "The size of the scene",
    },
  },
} satisfies Meta<typeof WelcomeScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "md",
  },
};
