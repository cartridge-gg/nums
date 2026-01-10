import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stages } from "./stages";
import type { StageState } from "../elements";

const meta = {
  title: "Containers/Stages",
  component: Stages,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      options: {
        dark: {
          name: "dark",
          value: "#4419C5",
        },
      },
    },
  },
} satisfies Meta<typeof Stages>;

export default meta;
type Story = StoryObj<typeof meta>;

const states: Array<StageState> = [
  {},
  {},
  {},
  { gem: true },
  {},
  {},
  {},
  { gem: true },
  {},
  {},
  {},
  { gem: true },
  {},
  { breakeven: true },
  {},
  { gem: true },
  {},
  {},
  {},
  { crown: true },
];

export const Default: Story = {
  args: {
    states,
  },
};

export const Completed: Story = {
  args: {
    states: states.map((state) => ({ ...state, completed: true })),
  },
};
