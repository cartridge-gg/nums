import { forwardRef, memo } from "react";
import type { StateIconProps } from "../types";
import { iconVariants } from "../utils";

export const GiftIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g filter="url(#filter0_d_1282_7882)">
          <path
            d="M9.95312 6.15L11.0406 8H11H8.75C8.05937 8 7.5 7.44062 7.5 6.75C7.5 6.05938 8.05937 5.5 8.75 5.5H8.81875C9.28437 5.5 9.71875 5.74688 9.95312 6.15ZM6 6.75C6 7.2 6.10938 7.625 6.3 8H5C4.44687 8 4 8.44688 4 9V11C4 11.5531 4.44687 12 5 12H19C19.5531 12 20 11.5531 20 11V9C20 8.44688 19.5531 8 19 8H17.7C17.8906 7.625 18 7.2 18 6.75C18 5.23125 16.7688 4 15.25 4H15.1812C14.1844 4 13.2594 4.52813 12.7531 5.3875L12 6.67188L11.2469 5.39062C10.7406 4.52812 9.81562 4 8.81875 4H8.75C7.23125 4 6 5.23125 6 6.75ZM16.5 6.75C16.5 7.44062 15.9406 8 15.25 8H13H12.9594L14.0469 6.15C14.2844 5.74688 14.7156 5.5 15.1812 5.5H15.25C15.9406 5.5 16.5 6.05938 16.5 6.75ZM5 13V18.5C5 19.3281 5.67188 20 6.5 20H11V13H5ZM13 20H17.5C18.3281 20 19 19.3281 19 18.5V13H13V20Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1282_7882"
            x="4"
            y="4"
            width="18"
            height="18"
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
            <feOffset dx="2" dy="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.95 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1282_7882"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1282_7882"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

GiftIcon.displayName = "GiftIcon";
