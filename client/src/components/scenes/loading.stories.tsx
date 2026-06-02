import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingScene } from "./loading";

const meta = {
  title: "Scenes/Loading",
  component: LoadingScene,
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
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    title: {
      control: "text",
      description: "Optional title shown under the loader",
    },
    description: {
      control: "text",
      description: "Optional description shown under the loader",
    },
  },
} satisfies Meta<typeof LoadingScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};

export const BridgeWaiting: Story = {
  args: {
    variant: "default",
    title: "Creating Game",
    description: "Purchase confirmed. Waiting for the appchain game to arrive.",
  },
};
