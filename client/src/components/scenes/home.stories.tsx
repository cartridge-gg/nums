import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeScene } from "./home";
import { fn } from "storybook/test";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Scenes/Home",
  component: HomeScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="flex h-screen w-full p-4 md:p-6">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
} satisfies Meta<typeof HomeScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (args: Parameters<typeof HomeScene>[0]) => {
  return <HomeScene {...args} />;
};

const sampleActivities = [
  {
    gameId: 1,
    score: 15,
    payout: "+$2.50",
    to: "/game/1",
    timestamp: Math.floor(Date.now() / 1000),
    claimed: true,
  },
  {
    gameId: 2,
    score: 8,
    payout: "Practice",
    to: "#",
    timestamp: Math.floor(Date.now() / 1000) - 86400,
    claimed: true,
  },
];

export const Connected: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    isConnected: true,
    onConnect: fn(),
    onPractice: fn(),
    activitiesProps: { activities: sampleActivities },
  },
};

export const Disconnected: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    isConnected: false,
    onConnect: fn(),
    onPractice: fn(),
    activitiesProps: { activities: [] },
  },
};

export const NoActivities: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    isConnected: true,
    onConnect: fn(),
    onPractice: fn(),
    activitiesProps: { activities: [] },
  },
};
