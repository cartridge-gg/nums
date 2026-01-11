import type { Meta, StoryObj } from "@storybook/react-vite";
import { StageInfo } from "./stage-info";

const meta = {
  title: "Elements/StageInfo",
  component: StageInfo,
  parameters: {
    layout: "centered",
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
  },
} satisfies Meta<typeof StageInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
