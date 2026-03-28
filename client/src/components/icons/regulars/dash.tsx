import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const DashIcon = memo(
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
          d="M3.58718 13.0504C3.00823 13.0497 2.53792 12.5793 2.53711 12.0004C2.5363 11.4214 3.00536 10.9524 3.58435 10.9531C14.2134 10.9711 9.02412 10.963 20.3863 10.9783C20.9653 10.9791 21.4356 11.4494 21.4364 12.0284C21.4372 12.6074 20.9681 13.0764 20.3891 13.0756C10.2561 13.0585 14.3806 13.065 3.58718 13.0504Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

DashIcon.displayName = "DashIcon";
