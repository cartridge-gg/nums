import type { Meta, StoryObj } from "@storybook/react-vite";
import { Multiplier } from "./multiplier";

const meta = {
  title: "Elements/Multiplier",
  component: Multiplier,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="overflow-visible p-12">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    multiplier: {
      control: { type: "number", min: 1, max: 10, step: 0.5 },
      description: "Multiplier value (usually 1-10)",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
  },
  args: {
    multiplier: 2,
  },
} satisfies Meta<typeof Multiplier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    multiplier: 2,
  },
};

export const One: Story = {
  args: {
    multiplier: 1,
  },
};

export const Five: Story = {
  args: {
    multiplier: 5,
  },
};

export const Ten: Story = {
  args: {
    multiplier: 10,
  },
};

export const Decimal: Story = {
  args: {
    multiplier: 2.5,
  },
};

export const AllMultipliers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-8">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
        <Multiplier key={m} multiplier={m} />
      ))}
    </div>
  ),
};
