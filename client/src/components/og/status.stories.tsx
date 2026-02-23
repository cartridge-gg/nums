import type { Meta, StoryObj } from "@storybook/react-vite";
import { Status } from "./status";

const meta = {
  title: "OG/Status",
  component: Status,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: { over: false },
};

export const FinalBoard: Story = {
  args: { over: true },
};
