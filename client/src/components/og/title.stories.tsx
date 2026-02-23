import type { Meta, StoryObj } from "@storybook/react-vite";
import { Title } from "./title";

const meta = {
  title: "OG/Title",
  component: Title,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: { over: false },
};

export const FinalBoard: Story = {
  args: { over: true },
};
