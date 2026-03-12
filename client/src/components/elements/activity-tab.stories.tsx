import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityTab } from "./activity-tab";

const meta = {
  title: "Elements/Activity Tab",
  component: ActivityTab,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "active"],
      description: "The visual state of the tab",
    },
    children: {
      control: "text",
      description: "The tab label text",
    },
  },
} satisfies Meta<typeof ActivityTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "All Games",
  },
};

export const Active: Story = {
  args: {
    children: "All Games",
    active: true,
  },
};
