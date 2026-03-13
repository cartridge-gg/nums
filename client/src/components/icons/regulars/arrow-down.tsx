import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const ArrowDownIcon = memo(
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
          d="M12.0002 4C12.4767 4 12.8637 4.38507 12.8637 4.85924L12.8637 16.9978L17.4168 12.2489C17.7461 11.9044 18.2947 11.8921 18.6375 12.2198C18.9825 12.5474 18.9949 13.0908 18.6667 13.4344L12.6246 19.7329C12.4641 19.9038 12.2375 20 12.0001 20C11.7628 20 11.5398 19.9038 11.3744 19.7338L5.33225 13.4354C5.00533 13.0934 5.01756 12.5495 5.36282 12.2202C5.70449 11.8926 6.25296 11.9049 6.58347 12.2493L11.1366 16.9982L11.1366 4.82712C11.137 4.35429 11.5254 4 12.0002 4Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ArrowDownIcon.displayName = "ArrowDownIcon";
