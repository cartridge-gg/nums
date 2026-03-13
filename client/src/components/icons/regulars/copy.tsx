import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CopyIcon = memo(
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
          d="M6 19H13C13.5531 19 14 18.5531 14 18V16.5C14 16.225 14.225 16 14.5 16C14.775 16 15 16.225 15 16.5V18C15 19.1031 14.1031 20 13 20H6C4.89531 20 4 19.1031 4 18V11C4 9.89687 4.89531 9 6 9H7.5C7.775 9 8 9.225 8 9.5C8 9.775 7.775 10 7.5 10H6C5.44781 10 5 10.4469 5 11V18C5 18.5531 5.44781 19 6 19ZM9 6C9 4.89531 9.89687 4 11 4H18C19.1031 4 20 4.89531 20 6V13C20 14.1031 19.1031 15 18 15H11C9.89687 15 9 14.1031 9 13V6ZM11 14H18C18.5531 14 19 13.5531 19 13V6C19 5.44781 18.5531 5 18 5H11C10.4469 5 10 5.44781 10 6V13C10 13.5531 10.4469 14 11 14Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

CopyIcon.displayName = "CopyIcon";
