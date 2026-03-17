import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const BookIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="-1 -1 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M18 21.6L7.2 21.6C5.21 21.6 3.6 19.99 3.6 18L3.6 6C3.6 4.01 5.21 2.4 7.2 2.4L18.6 2.4C19.59 2.4 20.4 3.21 20.4 4.2L20.4 15C20.4 15.78 19.9 16.45 19.2 16.7L19.2 19.2C19.86 19.2 20.4 19.74 20.4 20.4C20.4 21.06 19.86 21.6 19.2 21.6L18 21.6ZM7.2 16.8C6.54 16.8 6 17.34 6 18C6 18.66 6.54 19.2 7.2 19.2L16.8 19.2L16.8 16.8L7.2 16.8ZM8.4 8.1C8.4 8.6 8.8 9 9.3 9L15.9 9C16.4 9 16.8 8.6 16.8 8.1C16.8 7.6 16.4 7.2 15.9 7.2L9.3 7.2C8.8 7.2 8.4 7.6 8.4 8.1ZM9.3 10.8C8.8 10.8 8.4 11.2 8.4 11.7C8.4 12.2 8.8 12.6 9.3 12.6L15.9 12.6C16.4 12.6 16.8 12.2 16.8 11.7C16.8 11.2 16.4 10.8 15.9 10.8L9.3 10.8Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

BookIcon.displayName = "BookIcon";
