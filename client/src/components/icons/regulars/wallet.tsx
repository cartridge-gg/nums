import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const WalletIcon = memo(
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
          d="M6 5C4.89688 5 4 5.89688 4 7V17C4 18.1031 4.89688 19 6 19H18C19.1031 19 20 18.1031 20 17V10C20 8.89687 19.1031 8 18 8H6.5C6.225 8 6 7.775 6 7.5C6 7.225 6.225 7 6.5 7H18C18.5531 7 19 6.55313 19 6C19 5.44687 18.5531 5 18 5H6ZM17 12.5C17.2652 12.5 17.5196 12.6054 17.7071 12.7929C17.8946 12.9804 18 13.2348 18 13.5C18 13.7652 17.8946 14.0196 17.7071 14.2071C17.5196 14.3946 17.2652 14.5 17 14.5C16.7348 14.5 16.4804 14.3946 16.2929 14.2071C16.1054 14.0196 16 13.7652 16 13.5C16 13.2348 16.1054 12.9804 16.2929 12.7929C16.4804 12.6054 16.7348 12.5 17 12.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

WalletIcon.displayName = "WalletIcon";
