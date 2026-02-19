import { cva } from "class-variance-authority";

const base = "h-full w-full";

export const coverVariants = cva(base, {
  variants: {
    fit: {
      contain: "",
      cover: "",
    },
  },
  defaultVariants: {
    fit: "contain",
  },
});

export * from "./histogram";
export * from "./tutorial";
export * from "./glitchbomb";
export * from "./types";
