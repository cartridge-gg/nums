import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const ArrowLeftIcon = memo(
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
          d="M20 12.0008C20 12.4726 19.6149 12.8558 19.1408 12.8558H7.00223L11.7511 17.3639C12.0956 17.69 12.1079 18.2332 11.7802 18.5725C11.4526 18.9142 10.9092 18.9264 10.5656 18.6015L4.26714 12.619C4.09617 12.4601 4 12.2358 4 12.0008C4 11.7658 4.09617 11.545 4.26615 11.3812L10.5646 5.39876C10.9066 5.07507 11.4505 5.08718 11.7798 5.42903C12.1074 5.76732 12.0951 6.31037 11.7507 6.63762L7.00179 11.1458H19.1729C19.6457 11.1461 20 11.5307 20 12.0008Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ArrowLeftIcon.displayName = "ArrowLeftIcon";
