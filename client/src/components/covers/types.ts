import type { VariantProps } from "class-variance-authority";
import type { SVGProps } from "react";
import type { coverVariants } from ".";

export type CoverProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof coverVariants>,
  "variant"
>;
