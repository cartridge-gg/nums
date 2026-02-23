import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "./grid";

const meta = {
  title: "OG/Grid",
  component: Grid,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultValues = [
  0, 0, 149, 168, 187, 0, 272, 453, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0,
];

export const Default: Story = {
  args: { values: defaultValues },
};
