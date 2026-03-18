import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementCount } from "./achievement-count";

const meta = {
  title: "Elements/Achievement Count",
  component: AchievementCount,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    count: {
      control: "number",
      description: "Completed achievements",
    },
    total: {
      control: "number",
      description: "Total achievements",
    },
  },
} satisfies Meta<typeof AchievementCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 2,
    total: 26,
  },
};
