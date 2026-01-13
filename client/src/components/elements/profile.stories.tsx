import type { Meta, StoryObj } from "@storybook/react-vite";
import { Profile } from "./profile";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    username: {
      control: "text",
      description: "The user's username",
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
    username: "Clicksave",
    onClick: fn(),
  },
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Long: Story = {
  args: {
    username:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
  },
};
