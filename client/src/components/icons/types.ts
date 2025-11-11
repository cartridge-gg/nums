import type { VariantProps } from "class-variance-authority";
import type { SVGAttributes } from "react";
import type { iconVariants } from "./utils";

export type IconProps = SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants>;

export type DirectionalIconProps = SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants> & { variant: Direction };

export type Direction = "up" | "right" | "down" | "left";

export type StateIconProps = SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants> & { variant: "solid" | "line" };
