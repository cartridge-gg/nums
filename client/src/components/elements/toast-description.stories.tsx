import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastDescription } from "./toast-description";

const meta = {
  title: "Elements/Toast Description",
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playing: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white">
      <ToastDescription multiplier={1} />
      <ToastDescription multiplier={2} />
      <ToastDescription multiplier={3} />
      <ToastDescription multiplier={4} />
      <ToastDescription multiplier={5} />
      <ToastDescription multiplier={6} />
      <ToastDescription multiplier={7} />
      <ToastDescription multiplier={8} />
      <ToastDescription multiplier={9} />
      <ToastDescription multiplier={10} />
    </div>
  ),
};

export const Earning: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white">
      <ToastDescription earnings={286810} />
      <ToastDescription earnings={12400} />
    </div>
  ),
};
