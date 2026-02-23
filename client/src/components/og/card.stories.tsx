import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./card";

const meta = {
  title: "OG/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    scoreProps: {
      score: 17,
    },
    rewardProps: {
      reward: 1500,
    },
    infoProps: {
      over: false,
      values: [
        0, 0, 149, 168, 187, 0, 272, 453, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0,
      ],
    },
  },
};
