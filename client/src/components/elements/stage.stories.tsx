import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stage } from "./stage";

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

const types = [
  { label: "plain", state: {} },
  { label: "gem", state: { gem: true } },
  { label: "crown", state: { crown: true } },
] as const;

const flags = [
  { label: "default", state: {} },
  { label: "completed", state: { completed: true } },
  {
    label: "completed + unlocked",
    state: { completed: true, unlocked: true },
  },
] as const;

const Matrix = ({ variant }: { variant: "default" | "over" }) => (
  <table className="border-collapse text-xs text-white-100">
    <thead>
      <tr>
        <th />
        {types.map((t) => (
          <th key={t.label} className="px-3 py-1 font-medium">
            {t.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {[false, true].map((breakeven) =>
        flags.map((f) => (
          <tr key={`${breakeven}-${f.label}`}>
            <td className="whitespace-nowrap pr-4 py-1 text-right opacity-60">
              {breakeven
                ? f.label === "default"
                  ? "break even"
                  : `breakeven + ${f.label}`
                : f.label}
            </td>
            {types.map((t) => (
              <td key={t.label} className="px-3 py-1">
                <Stage
                  state={{
                    ...t.state,
                    ...f.state,
                    ...(breakeven ? { breakeven: true } : {}),
                  }}
                  className={variant === "over" ? "w-7" : "w-16"}
                  variant={variant}
                />
              </td>
            ))}
          </tr>
        )),
      )}
    </tbody>
  </table>
);

export const Default: Story = {
  render: () => <Matrix variant="default" />,
};

export const Over: Story = {
  render: () => <Matrix variant="over" />,
};

export const Interactive: Story = {
  argTypes: {
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
    unlocked: {
      control: "boolean",
      description: "Whether the stage is unlocked",
    },
  } as any,
  args: {
    completed: false,
    breakeven: false,
    gem: false,
    crown: false,
    unlocked: false,
  } as any,
  render: (args: any) => {
    const { completed, breakeven, gem, crown, unlocked, ...rest } = args;
    return (
      <Stage
        state={{ completed, breakeven, gem, crown, unlocked }}
        className="w-16"
        {...rest}
      />
    );
  },
};
