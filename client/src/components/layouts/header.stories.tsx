import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "./header";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Layouts/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  argTypes: {
    isMainnet: {
      control: "boolean",
      description: "Whether the current chain is mainnet",
    },
    isMuted: {
      control: "boolean",
      description: "Whether the sound is muted",
    },
    balance: {
      control: "text",
      description: "The balance value to display",
    },
    username: {
      control: "text",
      description: "The user's username",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    onToggleMute: {
      table: {
        disable: true,
      },
    },
    onBalance: {
      table: {
        disable: true,
      },
    },
    onConnect: {
      table: {
        disable: true,
      },
    },
    onProfile: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    isMuted: false,
    balance: "100,200",
    username: undefined,
    isMainnet: false,
    onToggleMute: () => {},
    onConnect: () => {},
    onProfile: () => {},
    onBalance: () => {},
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Connected: Story = {
  args: {
    username: "Username",
  },
};

export const Mainnet: Story = {
  args: {
    username: "Username",
    isMainnet: true,
  },
};
