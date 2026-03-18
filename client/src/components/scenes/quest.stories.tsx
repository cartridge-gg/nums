import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestScene } from "./quest";
import { fn } from "storybook/test";

const meta = {
  title: "Scenes/Quest",
  component: QuestScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof QuestScene>;

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
    questsProps: {
      quests: sampleQuests,
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    onClose: fn(),
  },
};

export const AllCompleted: Story = {
  args: {
    questsProps: {
      quests: sampleQuests.map((quest) => ({ ...quest, count: quest.total })),
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    onClose: fn(),
  },
};

export const Empty: Story = {
  args: {
    questsProps: {
      quests: [],
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    onClose: fn(),
  },
};
