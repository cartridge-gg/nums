import type { Meta, StoryObj } from "@storybook/react-vite";
import { Quests } from "./quests";

const meta = {
  title: "Containers/Quests",
  component: Quests,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="flex h-full w-full">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Quests>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleQuests = [
  {
    id: "DAILY_PLACER_ONE",
    icon: "fa-table-cells",
    title: "Orientation",
    description: "The work is mysterious and important.",
    count: 12,
    total: 20,
  },
  {
    id: "DAILY_POWER_ONE",
    icon: "fa-bolt",
    title: "Boost",
    description: "A little boost never hurt anyone.",
    count: 4,
    total: 4,
  },
  {
    id: "DAILY_TRIGGER_ONE",
    icon: "fa-bomb",
    title: "Risk Assessment",
    description: "Every stumble is a step forward.",
    count: 2,
    total: 6,
  },
];

export const Default: Story = {
  args: {
    quests: sampleQuests,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
  },
};

export const AllCompleted: Story = {
  args: {
    quests: sampleQuests.map((quest) => ({ ...quest, count: quest.total })),
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
  },
};

export const Empty: Story = {
  args: {
    quests: [],
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
  },
};

export const WithNotifications: Story = {
  args: {
    quests: sampleQuests,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    newQuestIds: new Set(["DAILY_PLACER_ONE", "DAILY_TRIGGER_ONE"]),
  },
};
