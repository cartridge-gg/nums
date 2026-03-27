import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Covers from "@/components/covers";

const meta = {
  title: "Assets/Covers",
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: () => <Covers.MainCover className="text-secondary-100" />,
};

export const Histogram: Story = {
  render: () => <Covers.HistogramCover className="text-primary-100" />,
};

export const Tutorial: Story = {
  render: () => <Covers.TutorialCover className="text-primary-100" />,
};

export const Glitchbomb: Story = {
  render: () => <Covers.GlitchbombCover />,
};
