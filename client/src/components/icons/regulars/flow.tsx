import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const FlowIcon = memo(
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
          d="M6.9967 14L6.9967 11.3267H8.3367V12.66H9.67004V13.9933H10.9967V6L12.9967 6L12.9967 13.9933H14.33V12.66H15.6634V11.3267H17.0034V14H15.67V15.3333H14.3367V16.6667H12.9967V18H10.9967V16.6667H9.66337V15.3333H8.33004V14L6.9967 14Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

FlowIcon.displayName = "FlowIcon";
