import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "./banner";

const meta = {
  title: "Elements/Banner",
  component: Banner,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["social", "tutorial", "glitchbomb"],
      description: "The visual variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
  args: {},
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Social: Story = {
  args: {
    variant: "social",
  },
};

export const Tutorial: Story = {
  args: {
    variant: "tutorial",
  },
};

export const Glitchbomb: Story = {
  args: {
    variant: "glitchbomb",
  },
};
