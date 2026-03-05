import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/exotics";

const meta = {
  title: "Icons/Exotics",
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Icônes exotiques
const exoticIcons = [
  { name: "AssetIcon", component: Icons.AssetIcon },
  { name: "DraggerIcon", component: Icons.DraggerIcon },
  { name: "LiveIcon", component: Icons.LiveIcon },
  { name: "LogoIcon", component: Icons.LogoIcon },
  { name: "LogoMiniIcon", component: Icons.LogoMiniIcon },
  { name: "NumsIcon", component: Icons.NumsIcon },
  { name: "QuoteIcon", component: Icons.QuoteIcon },
  { name: "TokenIcon", component: Icons.TokenIcon },
  { name: "VTokenIcon", component: Icons.VTokenIcon },
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
