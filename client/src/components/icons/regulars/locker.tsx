import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const LockerIcon = memo(
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
          d="M10 7.76471V9.64706H14V7.76471C14 6.72647 13.1031 5.88235 12 5.88235C10.8969 5.88235 10 6.72647 10 7.76471ZM8 9.64706V7.76471C8 5.68529 9.79063 4 12 4C14.2094 4 16 5.68529 16 7.76471V9.64706C17.1031 9.64706 18 10.4912 18 11.5294V18.1176C18 19.1559 17.1031 20 16 20H8C6.89688 20 6 19.1559 6 18.1176V11.5294C6 10.4912 6.89688 9.64706 8 9.64706Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

LockerIcon.displayName = "LockerIcon";
