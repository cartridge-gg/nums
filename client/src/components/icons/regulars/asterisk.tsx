import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const AsteriskIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g filter="url(#filter0_d_1524_8618)">
          <path
            d="M6.63243 5.25843L8.62703 4.55056L9 5.76405L6.98919 6.45506L8.31892 8.22472L7.32973 9L5.98378 7.16292L4.71892 8.98315L3.72973 8.20787L5.01081 6.45506L3 5.76405L3.37297 4.55056L5.35135 5.27528V3H6.63243V5.25843Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1524_8618"
            x="3"
            y="3"
            width="7"
            height="7"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="1" dy="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1524_8618"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1524_8618"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

AsteriskIcon.displayName = "AsteriskIcon";
