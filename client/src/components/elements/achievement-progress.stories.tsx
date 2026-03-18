import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementProgress } from "./achievement-progress";

const meta = {
  title: "Elements/Achievement Progress",
  component: AchievementProgress,
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
      description: "Current progress count",
    },
    total: {
      control: "number",
      description: "Total required for completion",
    },
    variant: {
      control: "select",
      options: ["default", "complete"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof AchievementProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    total: 10,
    variant: "default",
  },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
};

export const Complete: Story = {
  args: {
    count: 10,
    total: 10,
    variant: "complete",
  },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
};
