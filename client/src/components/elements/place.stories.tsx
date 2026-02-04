import type { Meta, StoryObj } from "@storybook/react-vite";
import { Place } from "./place";
import { Trap, TrapType } from "@/types/trap";

const meta = {
  title: "Elements/Place",
  component: Place,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    trap: {
      control: "object",
      description: "The trap to display",
    },
    onClick: {
      action: "clicked",
      description: "Callback when the Set button is clicked",
    },
  },
} satisfies Meta<typeof Place>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trap: new Trap(TrapType.Bomb),
    onClick: () => console.log("Set clicked"),
  },
};

export const Lucky: Story = {
  args: {
    trap: new Trap(TrapType.Lucky),
    onClick: () => console.log("Set clicked"),
  },
};

export const Magnet: Story = {
  args: {
    trap: new Trap(TrapType.Magnet),
    onClick: () => console.log("Set clicked"),
  },
};

export const UFO: Story = {
  args: {
    trap: new Trap(TrapType.UFO),
    onClick: () => console.log("Set clicked"),
  },
};

export const Windy: Story = {
  args: {
    trap: new Trap(TrapType.Windy),
    onClick: () => console.log("Set clicked"),
  },
};
