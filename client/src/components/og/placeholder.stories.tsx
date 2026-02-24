import type { Meta, StoryObj } from "@storybook/react-vite";
import { Placeholder } from "./placeholder";

const meta = {
  title: "OG/Placeholder",
  component: Placeholder,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Placeholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
