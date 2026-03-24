import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const ListIcon = memo(
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
          d="M4 6.28585C4 5.81264 4.38393 5.42871 4.85714 5.42871H19.1429C19.6179 5.42871 20 5.81264 20 6.28585C20 6.76085 19.6179 7.143 19.1429 7.143H4.85714C4.38393 7.143 4 6.76085 4 6.28585ZM4 12.0001C4 11.5251 4.38393 11.143 4.85714 11.143H19.1429C19.6179 11.143 20 11.5251 20 12.0001C20 12.4751 19.6179 12.8573 19.1429 12.8573H4.85714C4.38393 12.8573 4 12.4751 4 12.0001ZM11.1429 18.5716H4.85714C4.38393 18.5716 4 18.1894 4 17.7144C4 17.2394 4.38393 16.8573 4.85714 16.8573H11.1429C11.6179 16.8573 12 17.2394 12 17.7144C12 18.1894 11.6179 18.5716 11.1429 18.5716Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ListIcon.displayName = "ListIcon";
