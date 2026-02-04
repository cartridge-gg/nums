import type { Meta, StoryObj } from "@storybook/react-vite";
import { Places } from "./places";
import { Trap, TrapType } from "@/types/trap";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Places",
  component: Places,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    place: {
      control: false,
      description: "PlaceProps to display",
    },
    onClose: {
      action: "closed",
      description: "Callback when close button is clicked",
    },
  },
} satisfies Meta<typeof Places>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    place: {
      trap: new Trap(TrapType.Bomb),
      onClick: fn(),
    },
  },
};

export const Magnet: Story = {
  args: {
    place: {
      trap: new Trap(TrapType.Magnet),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const Lucky: Story = {
  args: {
    place: {
      trap: new Trap(TrapType.Lucky),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const UFO: Story = {
  args: {
    place: {
      trap: new Trap(TrapType.UFO),
      onClick: fn(),
    },
    onClose: fn(),
  },
};

export const Windy: Story = {
  args: {
    place: {
      trap: new Trap(TrapType.Windy),
      onClick: fn(),
    },
    onClose: fn(),
  },
};
