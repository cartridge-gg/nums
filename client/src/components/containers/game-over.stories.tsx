import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameOver } from "./game-over";

const meta = {
  title: "Containers/Game Over",
  component: GameOver,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    stats: {
      control: false,
      description: "Array of StatProps to display",
    },
  },
} satisfies Meta<typeof GameOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: [
      {
        title: "score",
        content: "14",
      },
      {
        title: "earned",
        content: "29,000 Nums ~ $2.12",
      },
    ],
  },
};
