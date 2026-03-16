import type { Meta, StoryObj } from "@storybook/react-vite";
import { Settings } from "./settings";
import { fn } from "storybook/test";

const meta = {
  title: "Containers/Settings",
  component: Settings,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  args: {
    onClose: fn(),
    musicVolume: 75,
    musicMuted: false,
    onMusicChange: fn(),
    onMusicMute: fn(),
    sfxVolume: 75,
    sfxMuted: false,
    onSfxChange: fn(),
    onSfxMute: fn(),
    onLeaderboard: fn(),
    onReferrals: fn(),
    onAchievements: fn(),
    onStaking: fn(),
    onLogOut: fn(),
  },
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
