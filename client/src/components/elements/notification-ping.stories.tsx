import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationPing } from "./notification-ping";

const meta = {
  title: "Elements/Notification Ping",
  component: NotificationPing,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="relative w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationPing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
