import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stage, type StageState } from "./stage";

const meta = {
  title: "Elements/Stage",
  component: Stage,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Stage>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStates: Array<StageState> = [
  {},
  { completed: true },
  { gem: true },
  { completed: true, gem: true },
  { breakeven: true },
  { breakeven: true, gem: true },
  { completed: true, breakeven: true },
  { completed: true, breakeven: true, gem: true },
  { crown: true },
  { crown: true, completed: true },
];

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {defaultStates.map((state) => (
        <Stage
          key={JSON.stringify(state)}
          state={state}
          className="w-16"
          variant="default"
        />
      ))}
    </div>
  ),
};

export const Over: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {defaultStates.map((state) => (
        <Stage
          key={JSON.stringify(state)}
          state={state}
          className="w-7"
          variant="over"
        />
      ))}
    </div>
  ),
};

const interactiveArgTypes = {
  completed: {
    control: "boolean",
    description: "Whether the stage is completed",
  },
  breakeven: {
    control: "boolean",
    description: "Whether the stage is at breakeven",
  },
  gem: {
    control: "boolean",
    description: "Whether the stage has a gem",
  },
  crown: {
    control: "boolean",
    description: "Whether the stage has a crown",
  },
} as any;

export const Interactive: Story = {
  argTypes: interactiveArgTypes,
  args: {
    completed: false,
    breakeven: false,
    gem: false,
    crown: false,
  } as any,
  render: (args: any) => {
    const { completed, breakeven, gem, crown, ...rest } = args;
    return (
      <Stage
        state={{ completed, breakeven, gem, crown }}
        className="w-16"
        {...rest}
      />
    );
  },
};
