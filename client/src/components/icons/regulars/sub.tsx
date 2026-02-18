import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const SubIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M18 13.3307V10.6641L6 10.6641V13.3307L18 13.3307Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

SubIcon.displayName = "SubIcon";
