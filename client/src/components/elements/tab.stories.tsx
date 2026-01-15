import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tab } from "./tab";
import { Tabs, TabsList } from "@/components/ui/tabs";
import * as icons from "@/components/icons";

const meta = {
  title: "Elements/Tab",
  component: Tab,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <Tabs defaultValue="tab1">
        <TabsList className="gap-3 bg-transparent p-0">
          <Story />
        </TabsList>
      </Tabs>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "tab1",
    label: "Quest",
    icon: icons.QuestIcon,
  },
};

export const WithStateIcon: Story = {
  args: {
    value: "tab2",
    label: "Leaderboard",
    icon: icons.TrophyIcon,
    iconProps: { variant: "solid" },
  },
};

export const Mauve: Story = {
  args: {
    value: "tab3",
    label: "Blitz",
    variant: "mauve",
  },
};

export const MauveDisabled: Story = {
  args: {
    value: "tab4",
    label: "Free",
    variant: "mauve",
    disabled: true,
  },
};
