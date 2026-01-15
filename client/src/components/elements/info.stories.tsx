import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info } from "./info";

const meta = {
  title: "Elements/Info",
  component: Info,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Info>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
