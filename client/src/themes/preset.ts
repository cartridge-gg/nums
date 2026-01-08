import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import twAnimate from "tailwindcss-animate";

export const preset: Partial<Config> = {
  darkMode: "selector",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--white-100)",
        },
        purple: {
          DEFAULT: "var(--purple-100)",
          100: "var(--purple-100)",
          200: "var(--purple-200)",
          300: "var(--purple-300)",
          400: "var(--purple-400)",
          500: "var(--purple-500)",
          600: "var(--purple-600)",
          700: "var(--purple-700)",
          800: "var(--purple-800)",
        },
        orange: {
          DEFAULT: "var(--orange-100)",
          100: "var(--orange-100)",
          200: "var(--orange-200)",
        },
        red: {
          DEFAULT: "var(--red-100)",
          100: "var(--red-100)",
        },
        green: {
          DEFAULT: "var(--green-100)",
          100: "var(--green-100)",
          200: "var(--green-200)",
        },
        pink: {
          DEFAULT: "var(--pink-100)",
          100: "var(--pink-100)",
          200: "var(--pink-200)",
        },
        brown: {
          DEFAULT: "var(--brown-100)",
          100: "var(--brown-100)",
        },
        black: {
          DEFAULT: "var(--black-100)",
          100: "var(--black-100)",
          200: "var(--black-200)",
          300: "var(--black-300)",
          400: "var(--black-400)",
          500: "var(--black-500)",
          600: "var(--black-600)",
          700: "var(--black-700)",
          800: "var(--black-800)",
          900: "var(--black-900)",
        },
        white: {
          DEFAULT: "var(--white-100)",
          100: "var(--white-100)",
          200: "var(--white-200)",
          300: "var(--white-300)",
          400: "var(--white-400)",
          500: "var(--white-500)",
          600: "var(--white-600)",
          700: "var(--white-700)",
          800: "var(--white-800)",
          900: "var(--white-900)",
        },
      },
      fontFamily: {
        body: ["PixelGame", "sans"],
        primary: ["PixelGame", "sans"],
        secondary: ["PPNeueBit", "sans"],
        tertiary: ["DMMono-Regular", "monospace"],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
        ppneuebit: ["PPNeueBit", "sans"],
        dmmono: ["DMMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": "10px",
        "10xl": "136px",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
    },
  },
  plugins: [twAnimate],
};
