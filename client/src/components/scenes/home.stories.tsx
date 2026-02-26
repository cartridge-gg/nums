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

export const Connected: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    isConnected: true,
    onConnect: fn(),
    onPractice: fn(),
  },
};

export const Disconnected: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    isConnected: false,
    onConnect: fn(),
    onPractice: fn(),
  },
};
