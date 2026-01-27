import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ranges } from "./ranges";
import { useState } from "react";
import type { RangeType } from "./ranges";
import { fn } from "storybook/test";
import { userEvent, within, expect } from "storybook/test";

const meta = {
  title: "Elements/Ranges",
  component: Ranges,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState<RangeType>(
        context.args.value || "All",
      );
      return (
        <Story
          args={{
            ...context.args,
            value,
            onValueChange: (newValue: RangeType) => {
              setValue(newValue);
              context.args.onValueChange?.(newValue);
            },
          }}
        />
      );
    },
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Ranges>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "All",
    onValueChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allButton = canvas.getByRole("button", { name: /all time/i });

    // Vérifier que le bouton All est actif (data-state="on")
    await expect(allButton).toHaveAttribute("data-state", "on");

    // Note: Les styles hover (hover:bg-white-900) sont visibles visuellement
    // mais ne peuvent pas être testés automatiquement car ils dépendent du CSS
    await userEvent.hover(allButton);
  },
};

export const OneDay: Story = {
  args: {
    value: "1D",
    onValueChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const oneDayButton = canvas.getByRole("button", { name: /1 day/i });
    const allButton = canvas.getByRole("button", { name: /all time/i });

    // Vérifier que le bouton 1D est actif
    await expect(oneDayButton).toHaveAttribute("data-state", "on");

    // Vérifier que les autres boutons sont inactifs
    await expect(allButton).toHaveAttribute("data-state", "off");

    // Tester le hover sur un bouton inactif
    await userEvent.hover(allButton);
  },
};

export const OneWeek: Story = {
  args: {
    value: "1W",
    onValueChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const oneWeekButton = canvas.getByRole("button", { name: /1 week/i });

    // Vérifier que le bouton 1W est actif
    await expect(oneWeekButton).toHaveAttribute("data-state", "on");
  },
};
