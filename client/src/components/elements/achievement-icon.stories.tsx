import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementIcon } from "./achievement-icon";

const meta = {
  title: "Elements/Achievement Icon",
  component: AchievementIcon,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    icon: {
      control: "text",
      description: "FontAwesome icon class (e.g. fa-fish)",
    },
    size: {
      control: "select",
      options: ["md", "lg"],
      description: "Icon size",
    },
  },
} satisfies Meta<typeof AchievementIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "fa-fish",
  },
};

export const Lg: Story = {
  args: {
    icon: "fa-fish",
    size: "lg",
  },
};
