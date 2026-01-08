import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/powers";

const meta = {
  title: "Components/Icons/Powers",
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

// Powers avec leurs variantes (normal, locked, used)
const powers = [
  {
    name: "BoostHigh",
    normal: Icons.BoostHighIcon,
    locked: Icons.BoostHighLockedIcon,
    used: Icons.BoostHighUsedIcon,
  },
  {
    name: "BoostLow",
    normal: Icons.BoostLowIcon,
    locked: Icons.BoostLowLockedIcon,
    used: Icons.BoostLowUsedIcon,
  },
  {
    name: "King",
    normal: Icons.KingIcon,
    locked: Icons.KingLockedIcon,
    used: Icons.KingUsedIcon,
  },
  {
    name: "DoubleUp",
    normal: Icons.DoubleUpIcon,
    locked: Icons.DoubleUpLockedIcon,
    used: Icons.DoubleUpUsedIcon,
  },
  {
    name: "Erase",
    normal: Icons.EraseIcon,
    locked: Icons.EraseLockedIcon,
    used: Icons.EraseUsedIcon,
  },
  {
    name: "Foresight",
    normal: Icons.ForesightIcon,
    locked: Icons.ForesightLockedIcon,
    used: Icons.ForesightUsedIcon,
  },
  {
    name: "Halve",
    normal: Icons.HalveIcon,
    locked: Icons.HalveLockedIcon,
    used: Icons.HalveUsedIcon,
  },
  {
    name: "Mirror",
    normal: Icons.MirrorIcon,
    locked: Icons.MirrorLockedIcon,
    used: Icons.MirrorUsedIcon,
  },
  {
    name: "Override",
    normal: Icons.OverrideIcon,
    locked: Icons.OverrideLockedIcon,
    used: Icons.OverrideUsedIcon,
  },
  {
    name: "Power",
    normal: Icons.PowerIcon,
    locked: Icons.PowerLockedIcon,
    used: Icons.PowerUsedIcon,
  },
  {
    name: "Reroll",
    normal: Icons.RerollIcon,
    locked: Icons.RerollLockedIcon,
    used: Icons.RerollUsedIcon,
  },
  {
    name: "Ribbon",
    normal: Icons.RibbonIcon,
    locked: Icons.RibbonLockedIcon,
    used: Icons.RibbonUsedIcon,
  },
  {
    name: "SquareDown",
    normal: Icons.SquareDownIcon,
    locked: Icons.SquareDownLockedIcon,
    used: Icons.SquareDownUsedIcon,
  },
  {
    name: "SquareUp",
    normal: Icons.SquareUpIcon,
    locked: Icons.SquareUpLockedIcon,
    used: Icons.SquareUpUsedIcon,
  },
  {
    name: "Swap",
    normal: Icons.SwapIcon,
    locked: Icons.SwapLockedIcon,
    used: Icons.SwapUsedIcon,
  },
  {
    name: "Wildcard",
    normal: Icons.WildcardIcon,
    locked: Icons.WildcardLockedIcon,
    used: Icons.WildcardUsedIcon,
  },
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.normal key={`${power.name}-normal`} size="xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.used key={`${power.name}-used`} size="xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.locked key={`${power.name}-locked`} size="xl" />
        ))}
      </div>
    </div>
  ),
};
