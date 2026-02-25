import type { Meta, StoryObj } from "@storybook/react-vite";
import { Countup } from "./countup";

const meta = {
  title: "Animations/Countup",
  component: Countup,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: [
        "4xs",
        "3xs",
        "2xs",
        "xs",
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        "3xl",
      ],
      description: "The size variant",
    },
  },
} satisfies Meta<typeof Countup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
};
