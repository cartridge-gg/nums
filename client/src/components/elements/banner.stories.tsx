import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { Banner } from "./banner";
import type { ControllerConfig } from "@cartridge/presets";
import { fn } from "storybook/test";

const mockConfig: ControllerConfig = {
  origin: [
    "lootsurvivor.io",
    "claims.lootsurvivor.io",
    "tournaments.lootsurvivor.io",
  ],
  theme: {
    name: "Loot Survivor",
    icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    cover: "https://static.cartridge.gg/presets/loot-survivor/cover.png",
    colors: {
      primary: "#33FF33",
    },
    optimizedIcon: {
      webp: {
        16: "https://static.cartridge.gg/presets/loot-survivor/icon@16.webp",
        32: "https://static.cartridge.gg/presets/loot-survivor/icon@32.webp",
        64: "https://static.cartridge.gg/presets/loot-survivor/icon@64.webp",
        128: "https://static.cartridge.gg/presets/loot-survivor/icon@128.webp",
        256: "https://static.cartridge.gg/presets/loot-survivor/icon@256.webp",
      },
      png: {
        16: "https://static.cartridge.gg/presets/loot-survivor/icon@16.png",
        32: "https://static.cartridge.gg/presets/loot-survivor/icon@32.png",
        64: "https://static.cartridge.gg/presets/loot-survivor/icon@64.png",
        128: "https://static.cartridge.gg/presets/loot-survivor/icon@128.png",
        256: "https://static.cartridge.gg/presets/loot-survivor/icon@256.png",
      },
    },
    optimizedCover: {
      webp: {
        768: "https://static.cartridge.gg/presets/loot-survivor/cover@768.webp",
        1024: "https://static.cartridge.gg/presets/loot-survivor/cover@1024.webp",
        1440: "https://static.cartridge.gg/presets/loot-survivor/cover@1440.webp",
      },
      jpg: {
        768: "https://static.cartridge.gg/presets/loot-survivor/cover@768.jpg",
        1024: "https://static.cartridge.gg/presets/loot-survivor/cover@1024.jpg",
        1440: "https://static.cartridge.gg/presets/loot-survivor/cover@1440.jpg",
      },
      png: {
        768: "https://static.cartridge.gg/presets/loot-survivor/cover@768.png",
        1024: "https://static.cartridge.gg/presets/loot-survivor/cover@1024.png",
        1440: "https://static.cartridge.gg/presets/loot-survivor/cover@1440.png",
      },
    },
  },
};

const meta = {
  title: "Elements/Banner",
  component: Banner,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  args: {},
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Social: Story = {
  args: {
    preset: "social",
    name: "social",
  },
};

export const Tutorial: Story = {
  args: {
    preset: "tutorial",
    name: "tutorial",
  },
};

export const LootSurvivor: Story = {
  args: {
    preset: "loot-survivor",
    name: "loot-survivor",
    config: mockConfig,
    position: 64,
    onClick: fn(),
  },
};
