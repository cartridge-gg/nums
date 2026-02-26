import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const XIcon = memo(
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
          d="M13.4893 10.7749L19.3176 4H17.9365L12.8758 9.88256L8.8338 4H4.17188L10.2841 12.8955L4.17188 20H5.55307L10.8973 13.7878L15.1659 20H19.8278L13.489 10.7749H13.4893ZM11.5976 12.9738L10.9783 12.0881L6.05073 5.03974H8.17217L12.1487 10.728L12.768 11.6137L17.9371 19.0075H15.8157L11.5976 12.9742V12.9738Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

XIcon.displayName = "XIcon";
