import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameInfo } from "./game-info";

const meta = {
  title: "Elements/GameInfo",
  component: GameInfo,
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
} satisfies Meta<typeof GameInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
