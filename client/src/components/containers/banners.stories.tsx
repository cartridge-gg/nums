import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banners } from "./banners";

const meta = {
  title: "Containers/Banners",
  component: Banners,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
} satisfies Meta<typeof Banners>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
