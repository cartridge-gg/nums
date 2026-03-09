import type { Config } from "tailwindcss";
import { preset } from "../client/src/themes/preset";

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "../client/src/**/*.{ts,tsx}",
  ],
  presets: [preset],
  theme: {
    extend: {
      keyframes: {
        "pulse-border": {
          "0%": {
            outline: "1px solid currentColor",
            outlineOffset: "1px",
            opacity: "0",
          },
          "50%": {
            outline: "1px solid currentColor",
            outlineOffset: "1px",
            opacity: "0.32",
          },
          "100%": {
            outline: "1px solid currentColor",
            outlineOffset: "6px",
            opacity: "0",
          },
        },
      },
      animation: {
        "pulse-border-0": "pulse-border 3s ease-out infinite 0s backwards",
        "pulse-border-1": "pulse-border 3s ease-out infinite 1s backwards",
        "pulse-border-2": "pulse-border 3s ease-out infinite 2s backwards",
      },
    },
  },
} satisfies Config;

export default config;
