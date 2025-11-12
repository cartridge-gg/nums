import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const SoundOffIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g filter="url(#filter0_d_772_6462)">
          <path
            d="M16.5882 14.1442L20.7401 10.4553V21.8367L16.5882 18.1516C16.4253 18.0071 16.2142 17.9256 15.9993 17.9256H12.7401C12.5771 17.9256 12.4438 17.7923 12.4438 17.6293V14.6664C12.4438 14.5034 12.5771 14.3701 12.7401 14.3701H15.9993C16.2179 14.3701 16.429 14.2886 16.5882 14.1442ZM21.4142 7.85156C21.1438 7.85156 20.8845 7.95156 20.6808 8.12934L15.6623 12.5923H12.7401C11.5956 12.5923 10.666 13.5219 10.666 14.6664V17.6293C10.666 18.7738 11.5956 19.7034 12.7401 19.7034H15.6623L20.6808 24.1664C20.8845 24.3442 21.1438 24.4442 21.4142 24.4442C22.0253 24.4442 22.5179 23.9516 22.5179 23.3405V8.95527C22.5179 8.34416 22.0253 7.85156 21.4142 7.85156Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_772_6462"
            x="10.666"
            y="7.85156"
            width="13.8516"
            height="18.5928"
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
              result="effect1_dropShadow_772_6462"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_772_6462"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

SoundOffIcon.displayName = "SoundOffIcon";
