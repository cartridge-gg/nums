import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const ArrowRightIcon = memo(
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
          d="M13.4492 5.38082L19.7344 11.3803C19.904 11.5421 20 11.7664 20 12.001C20 12.2356 19.904 12.4595 19.7344 12.6216L13.4492 18.6211C13.1066 18.947 12.5643 18.9347 12.2372 18.5921C11.9102 18.2529 11.9225 17.7083 12.2662 17.3801L17.0051 12.859H4.85743C4.38425 12.859 4 12.4748 4 12.0016C4 11.5284 4.38425 11.1449 4.85743 11.1449H17.0028L12.2639 6.62384C11.9208 6.29503 11.91 5.75043 12.235 5.41011C12.5636 5.06728 13.0742 5.05514 13.4492 5.38082Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ArrowRightIcon.displayName = "ArrowRightIcon";
