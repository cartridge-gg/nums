import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CheckIcon = memo(
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
          d="M8.98705 17.9226C8.64276 18.2668 8.08454 18.2668 7.74025 17.9226L4.72697 14.9093C4.32538 14.5077 4.32538 13.8566 4.72697 13.455C5.12856 13.0534 5.77966 13.0534 6.18124 13.455L8.36365 15.6374L17.818 6.18218C18.2198 5.78034 18.8713 5.78043 19.273 6.18239C19.6744 6.58414 19.6743 7.23525 19.2727 7.63687L8.98705 17.9226Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

CheckIcon.displayName = "CheckIcon";
