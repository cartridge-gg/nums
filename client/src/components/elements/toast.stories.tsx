import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "./toast";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Elements/Toast",
  component: Toast,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Achievement: Story = {
  args: {
    titleProps: {
      title: "Money Machine",
    },
    descriptionProps: {
      points: 20,
    },
    thumbnailProps: {
      type: "achievement",
    },
  },
};

export const Quest: Story = {
  args: {
    titleProps: {
      title: "Halfway Hero",
    },
    descriptionProps: {
      reward: "10,000 NUMS",
    },
    thumbnailProps: {
      type: "quest",
    },
  },
};

export const Purchase: Story = {
  args: {
    titleProps: {
      title: "Purchase Complete",
    },
    descriptionProps: {
      reward: "Nums Game(s)",
    },
    thumbnailProps: {
      type: "purchase",
    },
  },
};

export const Playing: Story = {
  args: {
    titleProps: {
      title: "Clicksave",
    },
    descriptionProps: {
      multiplier: 10,
    },
    actionProps: {
      to: "/",
    },
  },
};

export const Earning: Story = {
  args: {
    titleProps: {
      title: "Bal7hazar",
    },
    descriptionProps: {
      earning: 286810,
    },
    actionProps: {
      to: "/",
    },
  },
};
