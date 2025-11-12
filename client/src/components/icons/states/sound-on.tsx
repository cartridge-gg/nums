import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const SoundOnIcon = memo(
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
        <g filter="url(#filter0_d_772_6410)">
          <path
            d="M17.6694 7.95553C18.0954 8.14813 18.3694 8.57035 18.3694 9.03702V23.2592C18.3694 23.7259 18.0954 24.1481 17.6694 24.3407C17.2435 24.5333 16.7435 24.4555 16.3954 24.1444L11.3991 19.7037H8.88795C7.58054 19.7037 6.51758 18.6407 6.51758 17.3333V14.9629C6.51758 13.6555 7.58054 12.5926 8.88795 12.5926H11.3991L16.3954 8.15183C16.7435 7.84072 17.2435 7.76664 17.6694 7.95553ZM24.0398 10.6296C25.6398 11.9333 26.6657 13.9222 26.6657 16.1481C26.6657 18.3741 25.6398 20.3629 24.0398 21.6666C23.6583 21.9778 23.0991 21.9185 22.7879 21.537C22.4768 21.1555 22.5361 20.5963 22.9176 20.2852C24.1213 19.3074 24.8879 17.8185 24.8879 16.1481C24.8879 14.4778 24.1213 12.9889 22.9176 12.0074C22.5361 11.6963 22.4805 11.137 22.7879 10.7555C23.0954 10.3741 23.6583 10.3185 24.0398 10.6259V10.6296ZM21.7991 13.3889C22.5954 14.0407 23.1102 15.0333 23.1102 16.1481C23.1102 17.2629 22.5954 18.2555 21.7991 18.9074C21.4176 19.2185 20.8583 19.1592 20.5472 18.7778C20.2361 18.3963 20.2954 17.837 20.6768 17.5259C21.0768 17.2 21.3324 16.7037 21.3324 16.1481C21.3324 15.5926 21.0768 15.0963 20.6768 14.7666C20.2954 14.4555 20.2398 13.8963 20.5472 13.5148C20.8546 13.1333 21.4176 13.0778 21.7991 13.3852V13.3889Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_772_6410"
            x="6.51758"
            y="7.85254"
            width="22.1484"
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
              result="effect1_dropShadow_772_6410"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_772_6410"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

SoundOnIcon.displayName = "SoundOnIcon";
