import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/exotics";

const meta = {
  title: "Components/Icons/Exotics",
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

// Icônes exotiques
const exoticIcons = [
  { name: "LiveIcon", component: Icons.LiveIcon },
  { name: "LogoIcon", component: Icons.LogoIcon },
  { name: "LogoMiniIcon", component: Icons.LogoMiniIcon },
  { name: "NumsIcon", component: Icons.NumsIcon },
  { name: "StarknetIcon", component: Icons.StarknetIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 text-white">
      {exoticIcons.map(({ name, component: Icon }) => (
        <Icon key={name} size="xl" />
      ))}
    </div>
  ),
};
