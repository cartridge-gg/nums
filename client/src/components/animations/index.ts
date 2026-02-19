import { cva } from "class-variance-authority";

const base = "";

export const size = {
  "4xs": "h-1 w-1",
  "3xs": "h-2 w-2",
  "2xs": "h-3 w-3",
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
  "2xl": "h-14 w-14",
  "3xl": "h-16 w-16",
  "4xl": "h-20 w-20",
  "5xl": "h-24 w-24",
  "6xl": "h-28 w-28",
  "7xl": "h-32 w-32",
  "8xl": "h-36 w-36",
  "9xl": "h-40 w-40",
  "10xl": "h-44 w-44",
};

export const animationVariants = cva(base, {
  variants: {
    size,
  },
  defaultVariants: {
    size: "md",
  },
});

export * from "./countdown";
export * from "./types";
