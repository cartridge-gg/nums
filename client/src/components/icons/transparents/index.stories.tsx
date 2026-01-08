import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/transparents";

const meta = {
  title: "Icons/Transparents",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const transparentIcons = [
  { name: "CloseIcon", component: Icons.CloseIcon },
  { name: "GiftIcon", component: Icons.GiftIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 text-white">
      {transparentIcons.map(({ name, component: Icon }) => (
        <Icon key={name} size="xl" />
      ))}
    </div>
  ),
};
