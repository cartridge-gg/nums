import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

function Colors(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}

function Palette({ color, label }: { color: string; label: string }) {
  return (
    <div className="size-36 flex flex-shrink-0 flex-col rounded-lg overflow-hidden">
      <div
        className={`${color} h-2/3 flex justify-center items-center font-secondary text-base`}
      >
        {window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(color.replace("bg", "-"))}
      </div>
      <div className="bg-white text-black-100 flex justify-center items-center h-1/3 font-tertiary text-xs">
        {label}
      </div>
    </div>
  );
}

const meta: Meta<typeof Colors> = {
  title: "Styles/Colors",
  component: Colors,
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Colors>;

export const Purple: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-purple" label="bg-purple" />
        <Palette color="bg-purple-100" label="bg-purple-100" />
        <Palette color="bg-purple-200" label="bg-purple-200" />
        <Palette color="bg-purple-300" label="bg-purple-300" />
        <Palette color="bg-purple-400" label="bg-purple-400" />
        <Palette color="bg-purple-500" label="bg-purple-500" />
        <Palette color="bg-purple-600" label="bg-purple-600" />
        <Palette color="bg-purple-700" label="bg-purple-700" />
        <Palette color="bg-purple-800" label="bg-purple-800" />
        <Palette color="bg-purple-900" label="bg-purple-900" />
      </div>
    ),
  },
};

export const Mauve: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-mauve" label="bg-mauve" />
        <Palette color="bg-mauve-100" label="bg-mauve-100" />
        <Palette color="bg-mauve-200" label="bg-mauve-200" />
        <Palette color="bg-mauve-300" label="bg-mauve-300" />
        <Palette color="bg-mauve-400" label="bg-mauve-400" />
        <Palette color="bg-mauve-500" label="bg-mauve-500" />
        <Palette color="bg-mauve-600" label="bg-mauve-600" />
        <Palette color="bg-mauve-700" label="bg-mauve-700" />
        <Palette color="bg-mauve-800" label="bg-mauve-800" />
        <Palette color="bg-mauve-900" label="bg-mauve-900" />
      </div>
    ),
  },
};

export const Yellow: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-yellow" label="bg-yellow" />
        <Palette color="bg-yellow-100" label="bg-yellow-100" />
        <Palette color="bg-yellow-200" label="bg-yellow-200" />
        <Palette color="bg-yellow-300" label="bg-yellow-300" />
        <Palette color="bg-yellow-400" label="bg-yellow-400" />
        <Palette color="bg-yellow-500" label="bg-yellow-500" />
        <Palette color="bg-yellow-600" label="bg-yellow-600" />
        <Palette color="bg-yellow-700" label="bg-yellow-700" />
        <Palette color="bg-yellow-800" label="bg-yellow-800" />
        <Palette color="bg-yellow-900" label="bg-yellow-900" />
      </div>
    ),
  },
};

export const Red: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-red" label="bg-red" />
        <Palette color="bg-red-100" label="bg-red-100" />
        <Palette color="bg-red-200" label="bg-red-200" />
        <Palette color="bg-red-300" label="bg-red-300" />
        <Palette color="bg-red-400" label="bg-red-400" />
        <Palette color="bg-red-500" label="bg-red-500" />
        <Palette color="bg-red-600" label="bg-red-600" />
        <Palette color="bg-red-700" label="bg-red-700" />
        <Palette color="bg-red-800" label="bg-red-800" />
        <Palette color="bg-red-900" label="bg-red-900" />
      </div>
    ),
  },
};

export const Green: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-green" label="bg-green" />
        <Palette color="bg-green-100" label="bg-green-100" />
        <Palette color="bg-green-200" label="bg-green-200" />
        <Palette color="bg-green-300" label="bg-green-300" />
        <Palette color="bg-green-400" label="bg-green-400" />
        <Palette color="bg-green-500" label="bg-green-500" />
        <Palette color="bg-green-600" label="bg-green-600" />
        <Palette color="bg-green-700" label="bg-green-700" />
        <Palette color="bg-green-800" label="bg-green-800" />
        <Palette color="bg-green-900" label="bg-green-900" />
      </div>
    ),
  },
};

export const Pink: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-pink" label="bg-pink" />
        <Palette color="bg-pink-100" label="bg-pink-100" />
        <Palette color="bg-pink-200" label="bg-pink-200" />
        <Palette color="bg-pink-300" label="bg-pink-300" />
        <Palette color="bg-pink-400" label="bg-pink-400" />
        <Palette color="bg-pink-500" label="bg-pink-500" />
        <Palette color="bg-pink-600" label="bg-pink-600" />
        <Palette color="bg-pink-700" label="bg-pink-700" />
        <Palette color="bg-pink-800" label="bg-pink-800" />
        <Palette color="bg-pink-900" label="bg-pink-900" />
      </div>
    ),
  },
};

export const Blue: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-blue" label="bg-blue" />
        <Palette color="bg-blue-100" label="bg-blue-100" />
        <Palette color="bg-blue-200" label="bg-blue-200" />
        <Palette color="bg-blue-300" label="bg-blue-300" />
        <Palette color="bg-blue-400" label="bg-blue-400" />
        <Palette color="bg-blue-500" label="bg-blue-500" />
        <Palette color="bg-blue-600" label="bg-blue-600" />
        <Palette color="bg-blue-700" label="bg-blue-700" />
        <Palette color="bg-blue-800" label="bg-blue-800" />
        <Palette color="bg-blue-900" label="bg-blue-900" />
      </div>
    ),
  },
};

export const Brown: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-brown" label="bg-brown" />
        <Palette color="bg-brown-100" label="bg-brown-100" />
        <Palette color="bg-brown-200" label="bg-brown-200" />
        <Palette color="bg-brown-300" label="bg-brown-300" />
        <Palette color="bg-brown-400" label="bg-brown-400" />
        <Palette color="bg-brown-500" label="bg-brown-500" />
        <Palette color="bg-brown-600" label="bg-brown-600" />
        <Palette color="bg-brown-700" label="bg-brown-700" />
        <Palette color="bg-brown-800" label="bg-brown-800" />
        <Palette color="bg-brown-900" label="bg-brown-900" />
      </div>
    ),
  },
};

export const Black: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-black" label="bg-black" />
        <Palette color="bg-black-100" label="bg-black-100" />
        <Palette color="bg-black-200" label="bg-black-200" />
        <Palette color="bg-black-300" label="bg-black-300" />
        <Palette color="bg-black-400" label="bg-black-400" />
        <Palette color="bg-black-500" label="bg-black-500" />
        <Palette color="bg-black-600" label="bg-black-600" />
        <Palette color="bg-black-700" label="bg-black-700" />
        <Palette color="bg-black-800" label="bg-black-800" />
        <Palette color="bg-black-900" label="bg-black-900" />
      </div>
    ),
  },
};

export const Gray: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-gray" label="bg-gray" />
        <Palette color="bg-gray-100" label="bg-gray-100" />
        <Palette color="bg-gray-200" label="bg-gray-200" />
        <Palette color="bg-gray-300" label="bg-gray-300" />
        <Palette color="bg-gray-400" label="bg-gray-400" />
        <Palette color="bg-gray-500" label="bg-gray-500" />
        <Palette color="bg-gray-600" label="bg-gray-600" />
        <Palette color="bg-gray-700" label="bg-gray-700" />
        <Palette color="bg-gray-800" label="bg-gray-800" />
        <Palette color="bg-gray-900" label="bg-gray-900" />
      </div>
    ),
  },
};

export const White: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-white" label="bg-white" />
        <Palette color="bg-white-100" label="bg-white-100" />
        <Palette color="bg-white-200" label="bg-white-200" />
        <Palette color="bg-white-300" label="bg-white-300" />
        <Palette color="bg-white-400" label="bg-white-400" />
        <Palette color="bg-white-500" label="bg-white-500" />
        <Palette color="bg-white-600" label="bg-white-600" />
        <Palette color="bg-white-700" label="bg-white-700" />
        <Palette color="bg-white-800" label="bg-white-800" />
        <Palette color="bg-white-900" label="bg-white-900" />
      </div>
    ),
  },
};

export const Double: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-double" label="bg-double" />
        <Palette color="bg-double-100" label="bg-double-100" />
        <Palette color="bg-double-200" label="bg-double-200" />
        <Palette color="bg-double-300" label="bg-double-300" />
        <Palette color="bg-double-400" label="bg-double-400" />
        <Palette color="bg-double-500" label="bg-double-500" />
        <Palette color="bg-double-600" label="bg-double-600" />
        <Palette color="bg-double-700" label="bg-double-700" />
        <Palette color="bg-double-800" label="bg-double-800" />
        <Palette color="bg-double-900" label="bg-double-900" />
      </div>
    ),
  },
};

export const Down: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-down" label="bg-down" />
        <Palette color="bg-down-100" label="bg-down-100" />
        <Palette color="bg-down-200" label="bg-down-200" />
        <Palette color="bg-down-300" label="bg-down-300" />
        <Palette color="bg-down-400" label="bg-down-400" />
        <Palette color="bg-down-500" label="bg-down-500" />
        <Palette color="bg-down-600" label="bg-down-600" />
        <Palette color="bg-down-700" label="bg-down-700" />
        <Palette color="bg-down-800" label="bg-down-800" />
        <Palette color="bg-down-900" label="bg-down-900" />
      </div>
    ),
  },
};

export const Reroll: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-reroll" label="bg-reroll" />
        <Palette color="bg-reroll-100" label="bg-reroll-100" />
        <Palette color="bg-reroll-200" label="bg-reroll-200" />
        <Palette color="bg-reroll-300" label="bg-reroll-300" />
        <Palette color="bg-reroll-400" label="bg-reroll-400" />
        <Palette color="bg-reroll-500" label="bg-reroll-500" />
        <Palette color="bg-reroll-600" label="bg-reroll-600" />
        <Palette color="bg-reroll-700" label="bg-reroll-700" />
        <Palette color="bg-reroll-800" label="bg-reroll-800" />
        <Palette color="bg-reroll-900" label="bg-reroll-900" />
      </div>
    ),
  },
};

export const Wildcard: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-wildcard" label="bg-wildcard" />
        <Palette color="bg-wildcard-100" label="bg-wildcard-100" />
        <Palette color="bg-wildcard-200" label="bg-wildcard-200" />
        <Palette color="bg-wildcard-300" label="bg-wildcard-300" />
        <Palette color="bg-wildcard-400" label="bg-wildcard-400" />
        <Palette color="bg-wildcard-500" label="bg-wildcard-500" />
        <Palette color="bg-wildcard-600" label="bg-wildcard-600" />
        <Palette color="bg-wildcard-700" label="bg-wildcard-700" />
        <Palette color="bg-wildcard-800" label="bg-wildcard-800" />
        <Palette color="bg-wildcard-900" label="bg-wildcard-900" />
      </div>
    ),
  },
};

export const Swap: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-swap" label="bg-swap" />
        <Palette color="bg-swap-100" label="bg-swap-100" />
        <Palette color="bg-swap-200" label="bg-swap-200" />
        <Palette color="bg-swap-300" label="bg-swap-300" />
        <Palette color="bg-swap-400" label="bg-swap-400" />
        <Palette color="bg-swap-500" label="bg-swap-500" />
        <Palette color="bg-swap-600" label="bg-swap-600" />
        <Palette color="bg-swap-700" label="bg-swap-700" />
        <Palette color="bg-swap-800" label="bg-swap-800" />
        <Palette color="bg-swap-900" label="bg-swap-900" />
      </div>
    ),
  },
};

export const Halve: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-halve" label="bg-halve" />
        <Palette color="bg-halve-100" label="bg-halve-100" />
        <Palette color="bg-halve-200" label="bg-halve-200" />
        <Palette color="bg-halve-300" label="bg-halve-300" />
        <Palette color="bg-halve-400" label="bg-halve-400" />
        <Palette color="bg-halve-500" label="bg-halve-500" />
        <Palette color="bg-halve-600" label="bg-halve-600" />
        <Palette color="bg-halve-700" label="bg-halve-700" />
        <Palette color="bg-halve-800" label="bg-halve-800" />
        <Palette color="bg-halve-900" label="bg-halve-900" />
      </div>
    ),
  },
};

export const Up: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-up" label="bg-up" />
        <Palette color="bg-up-100" label="bg-up-100" />
        <Palette color="bg-up-200" label="bg-up-200" />
        <Palette color="bg-up-300" label="bg-up-300" />
        <Palette color="bg-up-400" label="bg-up-400" />
        <Palette color="bg-up-500" label="bg-up-500" />
        <Palette color="bg-up-600" label="bg-up-600" />
        <Palette color="bg-up-700" label="bg-up-700" />
        <Palette color="bg-up-800" label="bg-up-800" />
        <Palette color="bg-up-900" label="bg-up-900" />
      </div>
    ),
  },
};

export const Low: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-low" label="bg-low" />
        <Palette color="bg-low-100" label="bg-low-100" />
        <Palette color="bg-low-200" label="bg-low-200" />
        <Palette color="bg-low-300" label="bg-low-300" />
        <Palette color="bg-low-400" label="bg-low-400" />
        <Palette color="bg-low-500" label="bg-low-500" />
        <Palette color="bg-low-600" label="bg-low-600" />
        <Palette color="bg-low-700" label="bg-low-700" />
        <Palette color="bg-low-800" label="bg-low-800" />
        <Palette color="bg-low-900" label="bg-low-900" />
      </div>
    ),
  },
};

export const Foresight: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-foresight" label="bg-foresight" />
        <Palette color="bg-foresight-100" label="bg-foresight-100" />
        <Palette color="bg-foresight-200" label="bg-foresight-200" />
        <Palette color="bg-foresight-300" label="bg-foresight-300" />
        <Palette color="bg-foresight-400" label="bg-foresight-400" />
        <Palette color="bg-foresight-500" label="bg-foresight-500" />
        <Palette color="bg-foresight-600" label="bg-foresight-600" />
        <Palette color="bg-foresight-700" label="bg-foresight-700" />
        <Palette color="bg-foresight-800" label="bg-foresight-800" />
        <Palette color="bg-foresight-900" label="bg-foresight-900" />
      </div>
    ),
  },
};

export const High: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-high" label="bg-high" />
        <Palette color="bg-high-100" label="bg-high-100" />
        <Palette color="bg-high-200" label="bg-high-200" />
        <Palette color="bg-high-300" label="bg-high-300" />
        <Palette color="bg-high-400" label="bg-high-400" />
        <Palette color="bg-high-500" label="bg-high-500" />
        <Palette color="bg-high-600" label="bg-high-600" />
        <Palette color="bg-high-700" label="bg-high-700" />
        <Palette color="bg-high-800" label="bg-high-800" />
        <Palette color="bg-high-900" label="bg-high-900" />
      </div>
    ),
  },
};

export const Ribbon: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-ribbon" label="bg-ribbon" />
        <Palette color="bg-ribbon-100" label="bg-ribbon-100" />
        <Palette color="bg-ribbon-200" label="bg-ribbon-200" />
        <Palette color="bg-ribbon-300" label="bg-ribbon-300" />
        <Palette color="bg-ribbon-400" label="bg-ribbon-400" />
        <Palette color="bg-ribbon-500" label="bg-ribbon-500" />
        <Palette color="bg-ribbon-600" label="bg-ribbon-600" />
        <Palette color="bg-ribbon-700" label="bg-ribbon-700" />
        <Palette color="bg-ribbon-800" label="bg-ribbon-800" />
        <Palette color="bg-ribbon-900" label="bg-ribbon-900" />
      </div>
    ),
  },
};

export const Gem: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-gem" label="bg-gem" />
        <Palette color="bg-gem-100" label="bg-gem-100" />
        <Palette color="bg-gem-200" label="bg-gem-200" />
        <Palette color="bg-gem-300" label="bg-gem-300" />
        <Palette color="bg-gem-400" label="bg-gem-400" />
        <Palette color="bg-gem-500" label="bg-gem-500" />
        <Palette color="bg-gem-600" label="bg-gem-600" />
        <Palette color="bg-gem-700" label="bg-gem-700" />
        <Palette color="bg-gem-800" label="bg-gem-800" />
        <Palette color="bg-gem-900" label="bg-gem-900" />
      </div>
    ),
  },
};

export const Magnet: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-magnet" label="bg-magnet" />
        <Palette color="bg-magnet-100" label="bg-magnet-100" />
        <Palette color="bg-magnet-200" label="bg-magnet-200" />
        <Palette color="bg-magnet-300" label="bg-magnet-300" />
        <Palette color="bg-magnet-400" label="bg-magnet-400" />
        <Palette color="bg-magnet-500" label="bg-magnet-500" />
        <Palette color="bg-magnet-600" label="bg-magnet-600" />
        <Palette color="bg-magnet-700" label="bg-magnet-700" />
        <Palette color="bg-magnet-800" label="bg-magnet-800" />
        <Palette color="bg-magnet-900" label="bg-magnet-900" />
      </div>
    ),
  },
};

export const Windy: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-windy" label="bg-windy" />
        <Palette color="bg-windy-100" label="bg-windy-100" />
        <Palette color="bg-windy-200" label="bg-windy-200" />
        <Palette color="bg-windy-300" label="bg-windy-300" />
        <Palette color="bg-windy-400" label="bg-windy-400" />
        <Palette color="bg-windy-500" label="bg-windy-500" />
        <Palette color="bg-windy-600" label="bg-windy-600" />
        <Palette color="bg-windy-700" label="bg-windy-700" />
        <Palette color="bg-windy-800" label="bg-windy-800" />
        <Palette color="bg-windy-900" label="bg-windy-900" />
      </div>
    ),
  },
};

export const Lucky: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-lucky" label="bg-lucky" />
        <Palette color="bg-lucky-100" label="bg-lucky-100" />
        <Palette color="bg-lucky-200" label="bg-lucky-200" />
        <Palette color="bg-lucky-300" label="bg-lucky-300" />
        <Palette color="bg-lucky-400" label="bg-lucky-400" />
        <Palette color="bg-lucky-500" label="bg-lucky-500" />
        <Palette color="bg-lucky-600" label="bg-lucky-600" />
        <Palette color="bg-lucky-700" label="bg-lucky-700" />
        <Palette color="bg-lucky-800" label="bg-lucky-800" />
        <Palette color="bg-lucky-900" label="bg-lucky-900" />
      </div>
    ),
  },
};

export const Slots: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-slots" label="bg-slots" />
        <Palette color="bg-slots-100" label="bg-slots-100" />
        <Palette color="bg-slots-200" label="bg-slots-200" />
        <Palette color="bg-slots-300" label="bg-slots-300" />
        <Palette color="bg-slots-400" label="bg-slots-400" />
        <Palette color="bg-slots-500" label="bg-slots-500" />
        <Palette color="bg-slots-600" label="bg-slots-600" />
        <Palette color="bg-slots-700" label="bg-slots-700" />
        <Palette color="bg-slots-800" label="bg-slots-800" />
        <Palette color="bg-slots-900" label="bg-slots-900" />
      </div>
    ),
  },
};

export const Bomb: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-bomb" label="bg-bomb" />
        <Palette color="bg-bomb-100" label="bg-bomb-100" />
        <Palette color="bg-bomb-200" label="bg-bomb-200" />
        <Palette color="bg-bomb-300" label="bg-bomb-300" />
        <Palette color="bg-bomb-400" label="bg-bomb-400" />
        <Palette color="bg-bomb-500" label="bg-bomb-500" />
        <Palette color="bg-bomb-600" label="bg-bomb-600" />
        <Palette color="bg-bomb-700" label="bg-bomb-700" />
        <Palette color="bg-bomb-800" label="bg-bomb-800" />
        <Palette color="bg-bomb-900" label="bg-bomb-900" />
      </div>
    ),
  },
};

export const Ufo: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-ufo" label="bg-ufo" />
        <Palette color="bg-ufo-100" label="bg-ufo-100" />
        <Palette color="bg-ufo-200" label="bg-ufo-200" />
        <Palette color="bg-ufo-300" label="bg-ufo-300" />
        <Palette color="bg-ufo-400" label="bg-ufo-400" />
        <Palette color="bg-ufo-500" label="bg-ufo-500" />
        <Palette color="bg-ufo-600" label="bg-ufo-600" />
        <Palette color="bg-ufo-700" label="bg-ufo-700" />
        <Palette color="bg-ufo-800" label="bg-ufo-800" />
        <Palette color="bg-ufo-900" label="bg-ufo-900" />
      </div>
    ),
  },
};

export const Glitchbomb: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-glitchbomb" label="bg-glitchbomb" />
        <Palette color="bg-glitchbomb-100" label="bg-glitchbomb-100" />
        <Palette color="bg-glitchbomb-200" label="bg-glitchbomb-200" />
        <Palette color="bg-glitchbomb-300" label="bg-glitchbomb-300" />
        <Palette color="bg-glitchbomb-400" label="bg-glitchbomb-400" />
        <Palette color="bg-glitchbomb-500" label="bg-glitchbomb-500" />
        <Palette color="bg-glitchbomb-600" label="bg-glitchbomb-600" />
        <Palette color="bg-glitchbomb-700" label="bg-glitchbomb-700" />
        <Palette color="bg-glitchbomb-800" label="bg-glitchbomb-800" />
        <Palette color="bg-glitchbomb-900" label="bg-glitchbomb-900" />
      </div>
    ),
  },
};
