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
    title: "Claim a game",
    task: "Start and play 3 games",
    count: 2,
    total: 3,
    claimed: false,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    rewards: [
      {
        name: "Quest Reward",
        description: "200 NUMS",
        icon: "fa-coins",
      },
    ],
    onClaim: fn(),
  },
  {
    title: "Coin Collector",
    task: "Earn 2K Nums cumulated while playing",
    count: 240,
    total: 2000,
    claimed: false,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    rewards: [
      {
        name: "Quest Reward",
        description: "200 NUMS",
        icon: "fa-coins",
      },
    ],
    onClaim: fn(),
  },
  {
    title: "Halfway Hero",
    task: "Fill 10 slots within a single game",
    count: 1,
    total: 1,
    claimed: true,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    rewards: [
      {
        name: "Quest Reward",
        description: "200 NUMS",
        icon: "fa-coins",
      },
    ],
    onClaim: fn(),
  },
];

export const Default: Story = {
  args: {
    questsProps: {
      quests: [...sampleQuests, ...sampleQuests, ...sampleQuests],
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    onClose: fn(),
  },
};

export const WithClaimAll: Story = {
  args: {
    questsProps: {
      quests: sampleQuests.map((quest) => ({ ...quest, count: quest.total })),
      expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    },
    onClose: fn(),
    onClaimAll: fn(),
  },
};

export const AllClaimed: Story = {
  args: {
    questsProps: {
      quests: sampleQuests.map((quest) => ({
        ...quest,
        count: quest.total,
        claimed: true,
      })),
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
