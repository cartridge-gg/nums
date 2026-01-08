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
      </div>
    ),
  },
};

export const Orange: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-orange" label="bg-orange" />
        <Palette color="bg-orange-100" label="bg-orange-100" />
        <Palette color="bg-orange-200" label="bg-orange-200" />
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
