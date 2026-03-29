import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const ClockIcon = memo(
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
        <path
          d="M12 20C7.58125 20 4 16.4187 4 12C4 7.58125 7.58125 4 12 4C16.4187 4 20 7.58125 20 12C20 16.4187 16.4187 20 12 20ZM11.25 7.75V12C11.25 12.25 11.375 12.4844 11.5844 12.625L14.5844 14.625C14.9281 14.8562 15.3938 14.7625 15.625 14.4156C15.8562 14.0687 15.7625 13.6062 15.4156 13.375L12.75 11.6V7.75C12.75 7.33437 12.4156 7 12 7C11.5844 7 11.25 7.33437 11.25 7.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ClockIcon.displayName = "ClockIcon";
