import { forwardRef, memo } from "react";
import type { StateIconProps } from "../types";
import { iconVariants } from "../utils";

export const CrownIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 20 20"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M9.99838 5C9.73001 4.99943 9.48099 5.13754 9.34329 5.36276L6.80902 9.53696L3.7439 7.0773C3.49252 6.87615 3.13803 6.85267 2.86147 7.01999C2.5849 7.18675 2.44721 7.50653 2.51869 7.81656L4.0409 14.4206C4.12 14.7593 4.42762 14.9994 4.7827 15H15.213C15.5693 15.0006 15.8787 14.7599 15.9572 14.4206L17.4806 7.81715V7.81657C17.5538 7.50597 17.4155 7.18391 17.1378 7.01658C16.8601 6.84924 16.5038 6.87388 16.2525 7.07732L13.1903 9.53698L10.6532 5.36278C10.5155 5.13756 10.2665 4.99945 9.99812 5.00002L9.99838 5Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

CrownIcon.displayName = "CrownIcon";
