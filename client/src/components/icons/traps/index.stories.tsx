import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/traps";

const meta = {
  title: "Icons/Traps",
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

// Traps avec leurs variantes (regular, used, shadow)
const traps = [
  {
    name: "Bomb",
    regular: Icons.BombIcon,
    used: Icons.BombUsedIcon,
    shadow: Icons.BombShadowIcon,
  },
  {
    name: "Lucky",
    regular: Icons.LuckyIcon,
    used: Icons.LuckyUsedIcon,
    shadow: Icons.LuckyShadowIcon,
  },
  {
    name: "Magnet",
    regular: Icons.MagnetIcon,
    used: Icons.MagnetUsedIcon,
    shadow: Icons.MagnetShadowIcon,
  },
  {
    name: "Slots",
    regular: Icons.SlotsIcon,
    used: Icons.SlotsUsedIcon,
    shadow: Icons.SlotsShadowIcon,
  },
  {
    name: "Ufo",
    regular: Icons.UfoIcon,
    used: Icons.UfoUsedIcon,
    shadow: Icons.UfoShadowIcon,
  },
  {
    name: "Windy",
    regular: Icons.WindyIcon,
    used: Icons.WindyUsedIcon,
    shadow: Icons.WindyShadowIcon,
  },
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-wrap gap-4">
        {traps.map((trap) => (
          <trap.regular key={`${trap.name}-regular`} size="xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {traps.map((trap) => (
          <trap.used key={`${trap.name}-used`} size="xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {traps.map((trap) => (
          <trap.shadow key={`${trap.name}-shadow`} size="xl" />
        ))}
      </div>
    </div>
  ),
};
