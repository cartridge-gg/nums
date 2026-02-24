import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Num } from "./number";
import { Button } from "@/components/ui/button";
import { AudioProvider } from "@/context/audio";

const meta = {
  title: "Elements/Num",
  component: Num,
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
    value: {
      control: "number",
      description: "The number value to display",
    },
    invalid: {
      control: "boolean",
      description: "Whether the number is invalid",
    },
    variant: {
      control: "select",
      options: ["default", "secondary"],
      description: "The visual variant of the number",
    },
    sound: {
      control: "boolean",
      description: "Play slots sound when the counter rolls",
    },
  },
} satisfies Meta<typeof Num>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 262,
  },
};

export const Invalid: Story = {
  args: {
    value: 262,
    invalid: true,
  },
};

export const Secondary: Story = {
  args: {
    value: 679,
    variant: "secondary",
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);

    const generateRandomValue = () => {
      const randomValue = Math.floor(Math.random() * 999) + 1;
      setValue(randomValue);
    };

    return (
      <div className="flex flex-col gap-4 items-center">
        <Num value={value} sound />
        <Button onClick={generateRandomValue} variant="default">
          Generate Random (1-999)
        </Button>
      </div>
    );
  },
};
