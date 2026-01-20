import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Slot } from "./slot";

const meta = {
  title: "Elements/Slot",
  component: Slot,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    label: {
      control: "number",
      description: "The label number displayed on the slot",
    },
    value: {
      control: "number",
      description: "The value displayed in the button (0 shows 'Set')",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant of the slot",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size of the slot",
    },
    onSlotClick: {
      action: "clicked",
      description: "Callback function called when the slot button is clicked",
    },
  },
  args: {
    label: 1,
    onSlotClick: fn(),
  },
} satisfies Meta<typeof Slot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    invalid: true,
  },
};

export const Placed: Story = {
  args: {
    value: 100,
  },
};

export const Invalid: Story = {
  args: {
    value: 903,
    invalid: true,
  },
};

export const Placeholder: Story = {
  args: {
    variant: "placeholder",
  },
};
