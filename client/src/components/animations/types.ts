import type { VariantProps } from "class-variance-authority";
import type { ImgHTMLAttributes } from "react";
import type { animationVariants } from ".";

export type AnimationProps = Omit<
  ImgHTMLAttributes<HTMLImageElement> & VariantProps<typeof animationVariants>,
  "variant"
>;
