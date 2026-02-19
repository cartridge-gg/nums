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
};

export const iconVariants = cva(base, {
  variants: {
    size,
  },
  defaultVariants: {
    size: "md",
  },
});

export * from "./effects";
export * from "./exotics";
export * from "./powers";
export * from "./regulars";
export * from "./states";
export * from "./traps";
export * from "./types";
