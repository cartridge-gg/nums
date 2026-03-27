import type { Meta, StoryObj } from "@storybook/react-vite";
import { Settings } from "./settings";
import { fn } from "storybook/test";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Containers/Settings",
  component: Settings,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="mx-auto">
          <Story />
        </div>
      </BrowserRouter>
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
    onQuests: fn(),
    onStaking: fn(),
    onTutorial: fn(),
    onLogOut: fn(),
    onConnect: fn(),
    theme: "compliant" as const,
    onThemeChange: fn(),
    username: "Player123",
    onProfile: fn(),
  },
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disconnected: Story = {
  args: {
    username: undefined,
    onProfile: undefined,
  },
};

export const Rebellion: Story = {
  args: {
    theme: "rebellion" as const,
  },
};
