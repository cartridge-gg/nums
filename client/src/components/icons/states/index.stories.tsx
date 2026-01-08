import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/states";

const meta = {
  title: "Icons/States",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Icônes avec variant (solid/line)
const stateIcons = [
  { name: "TrophyIcon", component: Icons.TrophyIcon },
  { name: "SoundOffIcon", component: Icons.SoundOffIcon },
  { name: "SoundOnIcon", component: Icons.SoundOnIcon },
  { name: "HomeIcon", component: Icons.HomeIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-wrap gap-4">
        {stateIcons.map(({ name, component: Icon }) => (
          <Icon key={`${name}-solid`} size="xl" variant="solid" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {stateIcons.map(({ name, component: Icon }) => (
          <Icon key={`${name}-line`} size="xl" variant="line" />
        ))}
      </div>
    </div>
  ),
};
