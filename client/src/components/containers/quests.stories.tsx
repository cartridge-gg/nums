import type { Meta, StoryObj } from "@storybook/react-vite";
import { Quests } from "./quests";
import { fn } from "storybook/test";

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
    title: "Claim a game",
    task: "Start and play 3 games",
    count: 3,
    total: 3,
    claimed: false,
    expiration: 0,
    onClaim: fn(),
  },
  {
    title: "Coin Collector",
    task: "Earn 2K Nums cumulated while playing",
    count: 240,
    total: 2000,
    claimed: false,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
    onClaim: fn(),
  },
  {
    title: "Halfway Hero",
    task: "Fill 10 slots within a single game",
    count: 1,
    total: 1,
    claimed: true,
    expiration: 0,
    onClaim: fn(),
  },
];

export const Default: Story = {
  args: {
    quests: sampleQuests,
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
  },
};

export const Completed: Story = {
  args: {
    quests: sampleQuests.map((quest) => ({ ...quest, count: quest.total })),
    expiration: Date.now() / 1000 + 12 * 3600 + 24 * 60,
  },
};
