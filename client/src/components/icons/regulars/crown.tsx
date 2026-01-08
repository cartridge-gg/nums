import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CrownIcon = memo(
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
          d="M11.9981 6C11.676 5.99931 11.3772 6.16505 11.2119 6.43531L8.17082 11.4443L4.49267 8.49276C4.19103 8.25138 3.76563 8.2232 3.43376 8.42399C3.10187 8.62411 2.93665 9.00783 3.02242 9.37987L4.84908 17.3048C4.944 17.7112 5.31314 17.9993 5.73924 18H18.2556C18.6831 18.0007 19.0544 17.7119 19.1486 17.3048L20.9767 9.38058V9.37989C21.0646 9.00716 20.8987 8.62069 20.5654 8.41989C20.2321 8.21909 19.8046 8.24866 19.5029 8.49278L15.8284 11.4444L12.7838 6.43533C12.6186 6.16507 12.3198 5.99934 11.9977 6.00003L11.9981 6Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

CrownIcon.displayName = "CrownIcon";
