import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingTheme } from "./setting-theme";
import { fn } from "storybook/test";

const meta = {
  title: "Elements/Setting Theme",
  component: SettingTheme,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["compliant", "rebellion"],
    },
    selected: {
      control: "boolean",
    },
  },
  args: {
    variant: "compliant",
    selected: false,
    onClick: fn(),
  },
} satisfies Meta<typeof SettingTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compliant: Story = {};

export const CompliantSelected: Story = {
  args: {
    selected: true,
  },
};

export const Rebellion: Story = {
  args: {
    variant: "rebellion",
  },
};

export const RebellionSelected: Story = {
  args: {
    variant: "rebellion",
    selected: true,
  },
};

export const Pair: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <SettingTheme variant="compliant" selected />
      <SettingTheme variant="rebellion" />
    </div>
  ),
};
