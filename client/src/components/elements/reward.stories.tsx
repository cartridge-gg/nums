import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reward } from "./reward";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Elements/Reward",
  component: Reward,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    reward: {
      control: "number",
      description: "The reward value to display",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
  },
  args: {
    reward: 100200,
  },
} satisfies Meta<typeof Reward>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reward: 100200,
  },
};

export const Empty: Story = {
  args: {
    reward: 0,
  },
};

export const Small: Story = {
  args: {
    reward: 123,
  },
};

export const Thousands: Story = {
  args: {
    reward: 1234,
  },
};

export const TenThousands: Story = {
  args: {
    reward: 12345,
  },
};

export const HundredThousands: Story = {
  args: {
    reward: 123456,
  },
};

export const Millions: Story = {
  args: {
    reward: 1234567,
  },
};

export const Billions: Story = {
  args: {
    reward: 1234567890,
  },
};

export const Negative: Story = {
  args: {
    reward: -100,
  },
};

export const Interactive: Story = {
  render: () => {
    const [reward, setReward] = useState<number>(1000);

    const handleIncrement = (amount: number) => {
      setReward((prev) => prev + amount);
    };

    const handleDecrement = (amount: number) => {
      setReward((prev) => prev - amount);
    };

    return (
      <div className="flex flex-col gap-6 items-center">
        <Reward reward={reward} />
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-2">
            <Button onClick={() => handleIncrement(1)} variant="default">
              +1
            </Button>
            <Button onClick={() => handleIncrement(1000)} variant="default">
              +1000
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleDecrement(1000)} variant="default">
              -1000
            </Button>
            <Button onClick={() => handleDecrement(1)} variant="default">
              -1
            </Button>
          </div>
        </div>
      </div>
    );
  },
};
