import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const SpinnerPxIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <rect x="13" y="5" width="2" height="2" fill="currentColor" />
        <path d="M9 5H11V7H9V5Z" fill="currentColor" />
        <path d="M11 5L13 5.00003V7.00003L11 7V5Z" fill="currentColor" />
        <path d="M7 7.00003L9 7V9.00003H7V7.00003Z" fill="currentColor" />
        <path d="M5 9.00003H7V11H5V9.00003Z" fill="currentColor" />
        <path d="M5 11H7V13H5V11Z" fill="currentColor" />
        <path d="M5 13H7V15H5V13Z" fill="currentColor" />
        <path d="M7 15H9V17H7V15Z" fill="currentColor" />
        <rect x="9" y="17" width="2" height="2" fill="currentColor" />
      </svg>
    ),
  ),
);

SpinnerPxIcon.displayName = "SpinnerPxIcon";
