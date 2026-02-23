import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info } from "./info";

const meta = {
  title: "OG/Info",
  component: Info,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Info>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultValues = [
  0, 0, 149, 168, 187, 0, 272, 453, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0,
];

export const Default: Story = {
  args: { over: false, values: defaultValues },
};
