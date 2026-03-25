import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestCard } from "./quest-card";

const meta = {
  title: "Elements/Quest Card",
  component: QuestCard,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    icon: {
      control: "text",
    },
    title: {
      control: "text",
    },
    description: {
      control: "text",
    },
    count: {
      control: "number",
    },
    total: {
      control: "number",
    },
    variant: {
      control: "select",
      options: ["default", "complete"],
    },
  },
} satisfies Meta<typeof QuestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "fa-table-cells",
    title: "Orientation",
    description: "The work is mysterious and important.",
    count: 12,
    total: 20,
    variant: "default",
  },
};

export const Complete: Story = {
  args: {
    icon: "fa-table-cells",
    title: "Orientation",
    description: "The work is mysterious and important.",
    count: 20,
    total: 20,
    variant: "complete",
  },
};

export const WithNotification: Story = {
  args: {
    icon: "fa-table-cells",
    title: "Orientation",
    description: "The work is mysterious and important.",
    count: 12,
    total: 20,
    variant: "default",
    isNew: true,
  },
};
