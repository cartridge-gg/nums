import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Slot } from "./slot";
import { Trap, TrapType } from "@/types/trap";
import { AudioProvider } from "@/context/audio";

const meta = {
  title: "Elements/Slot",
  component: Slot,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <AudioProvider>
        <Story />
      </AudioProvider>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    label: {
      control: "number",
      description: "The label number displayed on the slot",
    },
    value: {
      control: "number",
      description: "The value displayed in the button (0 shows 'Set')",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant of the slot",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size of the slot",
    },
    onSlotClick: {
      action: "clicked",
      description: "Callback function called when the slot button is clicked",
    },
  },
  args: {
    label: 1,
    onSlotClick: fn(),
  },
} satisfies Meta<typeof Slot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Locked: Story = {
  args: {
    variant: "locked",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    invalid: true,
  },
};

export const Placed: Story = {
  args: {
    value: 100,
  },
};

export const Invalid: Story = {
  args: {
    value: 903,
    invalid: true,
  },
};

export const Placeholder: Story = {
  args: {
    variant: "placeholder",
  },
};

export const Bomb: Story = {
  args: {
    trap: new Trap(TrapType.Bomb),
  },
};

export const BombValue: Story = {
  args: {
    value: 100,
    trap: new Trap(TrapType.Bomb),
  },
};

export const BombInvalid: Story = {
  args: {
    invalid: true,
    trap: new Trap(TrapType.Bomb),
  },
};

export const BombInactive: Story = {
  args: {
    inactive: true,
    trap: new Trap(TrapType.Bomb),
  },
};

export const Magnet: Story = {
  args: {
    trap: new Trap(TrapType.Magnet),
  },
};

export const Windy: Story = {
  args: {
    trap: new Trap(TrapType.Windy),
  },
};

export const Lucky: Story = {
  args: {
    trap: new Trap(TrapType.Lucky),
  },
};

export const UFO: Story = {
  args: {
    trap: new Trap(TrapType.UFO),
  },
};
