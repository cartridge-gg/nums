import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementItem } from "./achievement-item";

const meta = {
  title: "Elements/Achievement Item",
  component: AchievementItem,
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
    name: {
      control: "text",
      description: "Achievement name",
    },
    count: {
      control: "number",
      description: "Current progress count",
    },
    total: {
      control: "number",
      description: "Total required for completion",
    },
    variant: {
      control: "select",
      options: ["default", "complete", "hidden", "empty"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof AchievementItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "fa-fish",
    name: "Double Up",
    count: 3,
    total: 10,
    variant: "default",
  },
};

export const Complete: Story = {
  args: {
    icon: "fa-fish",
    name: "Double Up",
    count: 10,
    total: 10,
    variant: "complete",
  },
};

export const Empty: Story = {
  args: {},
};

export const Hidden: Story = {
  args: {
    icon: "fa-fish",
    name: "Double Up",
    count: 3,
    total: 10,
    variant: "default",
    hidden: true,
  },
};
export const Selected: Story = {
  args: {
    icon: "fa-fish",
    name: "Double Up",
    count: 3,
    total: 10,
    variant: "default",
    selected: true,
  },
};

export const WithNotification: Story = {
  args: {
    icon: "fa-fish",
    name: "Double Up",
    count: 10,
    total: 10,
    variant: "complete",
    isNew: true,
  },
};
