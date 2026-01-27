import type { Meta, StoryObj } from "@storybook/react-vite";
import { Detail } from "./detail";

const meta = {
  title: "Elements/Detail",
  component: Detail,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Detail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Entry Fee",
    content: "$1.00",
  },
};
