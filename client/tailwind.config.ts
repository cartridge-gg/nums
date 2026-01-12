import type { Config } from "tailwindcss";
import { preset } from "./src/themes/preset";

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{html,ts,tsx}",
    "./node_modules/@cartridge/ui/dist/**/*.{js,jsx}",
  ],
  presets: [preset],
  theme: {
    extend: {
      width: {
        desktop: "432px",
      },
      height: {
        desktop: "600px",
      },
      screens: {
        xs: "360px",
      },
    },
  },
} satisfies Config;

export default config;
