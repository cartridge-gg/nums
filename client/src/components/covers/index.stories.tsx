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

export const Histogram: Story = {
  render: () => <Covers.HistogramCover className="text-mauve-100" />,
};

export const Tutorial: Story = {
  render: () => <Covers.TutorialCover className="text-mauve-100" />,
};

export const Glitchbomb: Story = {
  render: () => <Covers.GlitchbombCover />,
};
