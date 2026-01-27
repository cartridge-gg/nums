import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const PlusIcon = memo(
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
          d="M11 20H13V13H20V11H13V4H11V11H4V13H11V20Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

PlusIcon.displayName = "PlusIcon";
