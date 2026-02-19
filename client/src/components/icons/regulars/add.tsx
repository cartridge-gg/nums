import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const AddIcon = memo(
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
          d="M10.6667 13.3307V18H13.3333V13.3307H18V10.6641H13.3333V6H10.6667V10.6641L6 10.6641V13.3307H10.6667Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

AddIcon.displayName = "AddIcon";
