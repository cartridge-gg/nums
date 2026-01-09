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

export const Power: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-power" label="bg-power" />
        <Palette color="bg-power-100" label="bg-power-100" />
        <Palette color="bg-power-150" label="bg-power-150" />
        <Palette color="bg-power-200" label="bg-power-200" />
        <Palette color="bg-power-300" label="bg-power-300" />
        <Palette color="bg-power-350" label="bg-power-350" />
        <Palette color="bg-power-400" label="bg-power-400" />
        <Palette color="bg-power-450" label="bg-power-450" />
        <Palette color="bg-power-550" label="bg-power-550" />
        <Palette color="bg-power-600" label="bg-power-600" />
        <Palette color="bg-power-650" label="bg-power-650" />
        <Palette color="bg-power-700" label="bg-power-700" />
      </div>
    ),
  },
};
