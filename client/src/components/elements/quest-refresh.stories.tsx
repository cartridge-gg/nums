import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestRefresh } from "./quest-refresh";

const meta = {
  title: "Elements/Quest Refresh",
  component: QuestRefresh,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    expiration: {
      control: "number",
    },
    variant: {
      control: "select",
      options: ["default"],
    },
  },
} satisfies Meta<typeof QuestRefresh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    expiration: Math.floor(Date.now() / 1000) + 12 * 3600 + 24 * 60,
    variant: "default",
  },
};
