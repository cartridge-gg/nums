import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementCard } from "./achievement-card";

const meta = {
  title: "Elements/Achievement Card",
  component: AchievementCard,
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
      description: "FontAwesome icon class (e.g. fa-fish)",
    },
    title: {
      control: "text",
      description: "Achievement title",
    },
    description: {
      control: "text",
      description: "Achievement task description",
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
      options: ["default", "complete", "float"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof AchievementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "fa-fish",
    title: "First Million",
    description: "Claim NUMS Tokens",
    count: 240,
    total: 1000,
    variant: "default",
  },
};

export const Complete: Story = {
  args: {
    icon: "fa-fish",
    title: "First Million",
    description: "Claim NUMS Tokens",
    count: 100000,
    total: 100000,
    variant: "complete",
  },
};

export const Float: Story = {
  args: {
    icon: "fa-fish",
    title: "First Million",
    description: "Claim NUMS Tokens",
    count: 100000,
    total: 100000,
    variant: "float",
  },
};

export const CompleteSingle: Story = {
  args: {
    icon: "fa-fish",
    title: "First Million",
    description: "Claim NUMS Tokens",
    count: 1,
    total: 1,
    variant: "complete",
  },
};
