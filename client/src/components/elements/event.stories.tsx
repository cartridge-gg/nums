import type { Meta, StoryObj } from "@storybook/react-vite";
import { Event } from "./event";

const meta = {
  title: "Elements/Event",
  component: Event,
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
      options: ["default"],
      description: "The visual variant",
    },
    username: {
      control: "text",
      description: "The username to display",
    },
    multiplier: {
      control: "number",
      description: "The multiplier value",
    },
    earning: {
      control: "number",
      description: "The earning amount",
    },
  },
} satisfies Meta<typeof Event>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Multiplier: Story = {
  args: {
    username: "Bal7hazar",
    multiplier: 2,
    timestamp: 0,
    id: "multiplier",
  },
};

export const Earning: Story = {
  args: {
    username: "Bal7hazar",
    earning: 286810,
    timestamp: 0,
    id: "earning",
  },
};
