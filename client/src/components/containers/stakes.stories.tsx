import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stakes } from "./stakes";
import { useState } from "react";

const meta = {
  title: "Containers/Stakes",
  component: Stakes,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Stakes>;

export default meta;
type Story = StoryObj<typeof meta>;

const StakesWrapper = ({
  total,
  initialIndex = 0,
}: {
  total: number;
  initialIndex?: number;
}) => {
  const [index, setIndex] = useState(initialIndex);
  return <Stakes total={total} index={index} setIndex={setIndex} />;
};

export const Default: Story = {
  render: () => <StakesWrapper total={5} />,
};

export const WithInitialIndex: Story = {
  render: () => <StakesWrapper total={5} initialIndex={2} />,
};

export const Small: Story = {
  render: () => <StakesWrapper total={3} />,
};

export const Large: Story = {
  render: () => <StakesWrapper total={10} />,
};

export const Full: Story = {
  render: () => <StakesWrapper total={5} initialIndex={5} />,
};
