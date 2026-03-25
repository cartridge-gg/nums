import type { Meta, StoryObj } from "@storybook/react-vite";
import { MissionScene } from "./mission";
import { fn } from "storybook/test";

const meta = {
  title: "Scenes/Mission",
  component: MissionScene,
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
} satisfies Meta<typeof MissionScene>;

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

const sampleAchievements = [
  {
    id: "FIRST_MILLION",
    icon: "fa-coins",
    title: "First Million",
    description: "Claim NUMS Tokens",
    count: 100000,
    total: 100000,
  },
  {
    id: "NOVICE",
    icon: "fa-graduation-cap",
    title: "Novice",
    description: "Play 10 games",
    count: 10,
    total: 10,
  },
  {
    id: "EMERGENCY_MODE",
    icon: "fa-bolt",
    title: "Emergency Mode",
    description: "Use 5 power-ups in a single game",
    count: 5,
    total: 5,
  },
  {
    id: "DOUBLE_UP",
    icon: "fa-arrow-up",
    title: "Double Up",
    description: "Use the double power-up 10 times",
    count: 3,
    total: 10,
  },
  {
    id: "MONEY_MACHINE",
    icon: "fa-money-bill",
    title: "Money Machine",
    description: "Earn 2K Nums cumulated",
    count: 500,
    total: 2000,
  },
  {
    id: "ROLLING_IN_IT",
    icon: "fa-trophy",
    title: "Rolling in it",
    description: "Win a jackpot",
    count: 0,
    total: 1,
  },
];

export const Quests: Story = {
  args: {
    questsProps: {
      quests: sampleQuests,
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    achievementsProps: {
      achievements: sampleAchievements,
    },
    defaultTab: "quests",
    onClose: fn(),
  },
};

export const Achievements: Story = {
  args: {
    questsProps: {
      quests: sampleQuests,
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    achievementsProps: {
      achievements: sampleAchievements,
    },
    defaultTab: "achievements",
    onClose: fn(),
  },
};
