import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const PlayIcon = memo(
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
          d="M16.5277 10.9026C16.9108 11.1384 17.1439 11.5536 17.1439 12.001C17.1439 12.4484 16.9108 12.8637 16.5277 13.0753L8.81293 17.7904C8.4159 18.0556 7.91894 18.0663 7.51334 17.8386C7.10766 17.6109 6.85645 17.1822 6.85645 16.7161V7.28595C6.85645 6.82088 7.10766 6.39197 7.51334 6.16425C7.91894 5.9368 8.4159 5.94618 8.81293 6.18863L16.5277 10.9026Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

PlayIcon.displayName = "PlayIcon";
