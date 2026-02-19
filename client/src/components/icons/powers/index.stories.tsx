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
    color: "text-high-100",
    normal: Icons.BoostHighIcon,
    locked: Icons.BoostHighLockedIcon,
    used: Icons.BoostHighUsedIcon,
  },
  {
    name: "BoostLow",
    color: "text-low-100",
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
    color: "text-double-100",
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
    color: "text-foresight-100",
    normal: Icons.ForesightIcon,
    locked: Icons.ForesightLockedIcon,
    used: Icons.ForesightUsedIcon,
  },
  {
    name: "Halve",
    color: "text-halve-100",
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
    color: "text-gem-100",
    normal: Icons.GemIcon,
    locked: Icons.GemLockedIcon,
    used: Icons.GemUsedIcon,
  },
  {
    name: "Reroll",
    color: "text-reroll-100",
    normal: Icons.RerollIcon,
    locked: Icons.RerollLockedIcon,
    used: Icons.RerollUsedIcon,
  },
  {
    name: "Ribbon",
    color: "text-ribbon-100",
    normal: Icons.RibbonIcon,
    locked: Icons.RibbonLockedIcon,
    used: Icons.RibbonUsedIcon,
  },
  {
    name: "SquareDown",
    color: "text-down-100",
    normal: Icons.SquareDownIcon,
    locked: Icons.SquareDownLockedIcon,
    used: Icons.SquareDownUsedIcon,
  },
  {
    name: "SquareUp",
    color: "text-up-100",
    normal: Icons.SquareUpIcon,
    locked: Icons.SquareUpLockedIcon,
    used: Icons.SquareUpUsedIcon,
  },
  {
    name: "Swap",
    color: "text-swap-100",
    normal: Icons.SwapIcon,
    locked: Icons.SwapLockedIcon,
    used: Icons.SwapUsedIcon,
  },
  {
    name: "Wildcard",
    color: "text-wildcard-100",
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
