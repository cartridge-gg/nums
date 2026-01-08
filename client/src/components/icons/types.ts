import type { VariantProps } from "class-variance-authority";
import type { SVGProps } from "react";
import type { iconVariants } from ".";

export type IconProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof iconVariants>,
  "variant"
>;

export type StateIconProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof iconVariants>,
  "variant"
> & { variant: "solid" | "line" };
