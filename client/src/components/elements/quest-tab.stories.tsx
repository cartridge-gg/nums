import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestTab } from "./quest-tab";
import { Tabs, TabsList } from "@/components/ui/tabs";

const meta = {
  title: "Elements/QuestTab",
  component: QuestTab,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof QuestTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  render: () => (
    <Tabs defaultValue="leaderboard">
      <TabsList className="gap-2 bg-transparent p-0">
        <QuestTab />
      </TabsList>
    </Tabs>
  ),
};

export const Active: Story = {
  render: () => (
    <Tabs defaultValue="quest">
      <TabsList className="gap-2 bg-transparent p-0">
        <QuestTab />
      </TabsList>
    </Tabs>
  ),
};
