import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameIcon } from "./game-icon";

const meta = {
  title: "Elements/Game Icon",
  component: GameIcon,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    cells: {
      control: "object",
      description:
        "Array of boolean | null: true = filled, false = empty, null = unused. Rendered as a pie chart showing fill ratio.",
    },
  },
} satisfies Meta<typeof GameIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cells: [
      null,
      false,
      true,
      true,
      false,
      false,
      true,
      false,
      true,
      true,
      true,
      true,
      false,
      false,
      true,
      false,
      true,
      true,
      false,
      null,
    ],
  },
};
