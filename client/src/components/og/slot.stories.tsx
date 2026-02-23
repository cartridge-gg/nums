import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slot } from "./slot";

const meta = {
  title: "OG/Slot",
  component: Slot,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Slot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithValue: Story = {
  args: { value: 5, locked: false },
};

export const Empty: Story = {
  args: { locked: false },
};

export const Locked: Story = {
  args: { value: 3, locked: true },
};

export const LockedEmpty: Story = {
  args: { locked: true },
};
