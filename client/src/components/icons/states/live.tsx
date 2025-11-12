import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const LiveIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <circle cx="6" cy="6" r="4" fill="#48F095" />
        <circle
          cx="6"
          cy="6"
          r="5"
          stroke="#48F095"
          strokeOpacity="0.48"
          strokeWidth="2"
        />
      </svg>
    ),
  ),
);

LiveIcon.displayName = "LiveIcon";
