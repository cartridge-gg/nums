import type { VariantProps } from "class-variance-authority";
import type { iconVariants } from ".";

export type IconProps = Omit<
  React.SVGAttributes<SVGElement> & VariantProps<typeof iconVariants>,
  "variant"
>;

export type StateIconProps = Omit<
  React.SVGAttributes<SVGElement> & VariantProps<typeof iconVariants>,
  "variant"
> & { variant: "solid" | "line" };
