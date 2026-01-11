import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Number } from "./number";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Elements/Number",
  component: Number,
  parameters: {
    layout: "centered",
  },
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
  },
} satisfies Meta<typeof Number>;

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
        <Number value={value} />
        <Button onClick={generateRandomValue} variant="default">
          Generate Random (1-999)
        </Button>
      </div>
    );
  },
};
