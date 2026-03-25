import type { Meta, StoryObj } from "@storybook/react-vite";
import { Achievements } from "./achievements";

const meta = {
  title: "Containers/Achievements",
  component: Achievements,
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
} satisfies Meta<typeof Achievements>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Default: Story = {
  args: {
    achievements: sampleAchievements,
  },
};

export const AllEarned: Story = {
  args: {
    achievements: sampleAchievements.map((a) => ({
      ...a,
      count: a.total,
    })),
  },
};

export const NoneEarned: Story = {
  args: {
    achievements: sampleAchievements.map((a) => ({
      ...a,
      count: Math.min(a.count, a.total - 1),
    })),
  },
};

export const WithNotifications: Story = {
  args: {
    achievements: sampleAchievements,
    newAchievementIds: new Set(["FIRST_MILLION", "EMERGENCY_MODE"]),
  },
};
