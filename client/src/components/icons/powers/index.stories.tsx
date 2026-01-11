import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/powers";

const meta = {
  title: "Icons/Powers",
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

// Powers avec leurs variantes (normal, locked, used)
const powers = [
  {
    name: "BoostHigh",
    color: "text-power-650",
    normal: Icons.BoostHighIcon,
    locked: Icons.BoostHighLockedIcon,
    used: Icons.BoostHighUsedIcon,
  },
  {
    name: "BoostLow",
    color: "text-power-550",
    normal: Icons.BoostLowIcon,
    locked: Icons.BoostLowLockedIcon,
    used: Icons.BoostLowUsedIcon,
  },
  {
    name: "King",
    color: "text-pink-100",
    normal: Icons.KingIcon,
    locked: Icons.KingLockedIcon,
    used: Icons.KingUsedIcon,
  },
  {
    name: "DoubleUp",
    color: "text-power-450",
    normal: Icons.DoubleUpIcon,
    locked: Icons.DoubleUpLockedIcon,
    used: Icons.DoubleUpUsedIcon,
  },
  {
    name: "Erase",
    color: "text-pink-100",
    normal: Icons.EraseIcon,
    locked: Icons.EraseLockedIcon,
    used: Icons.EraseUsedIcon,
  },
  {
    name: "Foresight",
    color: "text-power-600",
    normal: Icons.ForesightIcon,
    locked: Icons.ForesightLockedIcon,
    used: Icons.ForesightUsedIcon,
  },
  {
    name: "Halve",
    color: "text-power-350",
    normal: Icons.HalveIcon,
    locked: Icons.HalveLockedIcon,
    used: Icons.HalveUsedIcon,
  },
  {
    name: "Mirror",
    color: "text-blue-100",
    normal: Icons.MirrorIcon,
    locked: Icons.MirrorLockedIcon,
    used: Icons.MirrorUsedIcon,
  },
  {
    name: "Override",
    color: "text-red-300",
    normal: Icons.OverrideIcon,
    locked: Icons.OverrideLockedIcon,
    used: Icons.OverrideUsedIcon,
  },
  {
    name: "Gem",
    color: "text-power-700",
    normal: Icons.GemIcon,
    locked: Icons.GemLockedIcon,
    used: Icons.GemUsedIcon,
  },
  {
    name: "Reroll",
    color: "text-power-150",
    normal: Icons.RerollIcon,
    locked: Icons.RerollLockedIcon,
    used: Icons.RerollUsedIcon,
  },
  {
    name: "Ribbon",
    color: "text-power-450",
    normal: Icons.RibbonIcon,
    locked: Icons.RibbonLockedIcon,
    used: Icons.RibbonUsedIcon,
  },
  {
    name: "SquareDown",
    color: "text-power-100",
    normal: Icons.SquareDownIcon,
    locked: Icons.SquareDownLockedIcon,
    used: Icons.SquareDownUsedIcon,
  },
  {
    name: "SquareUp",
    color: "text-power-400",
    normal: Icons.SquareUpIcon,
    locked: Icons.SquareUpLockedIcon,
    used: Icons.SquareUpUsedIcon,
  },
  {
    name: "Swap",
    color: "text-power-300",
    normal: Icons.SwapIcon,
    locked: Icons.SwapLockedIcon,
    used: Icons.SwapUsedIcon,
  },
  {
    name: "Wildcard",
    color: "text-power-200",
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
          <power.normal
            key={`${power.name}-normal`}
            size="xl"
            className={power.color}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.normal key={`${power.name}-normal`} size="xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.used
            key={`${power.name}-used`}
            size="xl"
            className={"text-white-400"}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.locked key={`${power.name}-locked`} size="xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {powers.map((power) => (
          <power.locked
            key={`${power.name}-locked`}
            size="xl"
            className={power.color}
          />
        ))}
      </div>
    </div>
  ),
};
