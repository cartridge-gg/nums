import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const DisconnectIcon = memo(
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
        <g filter="url(#filter0_d_930_2154)">
          <path
            d="M26.3726 16.7077C26.7642 16.3161 26.7642 15.6828 26.3726 15.2953L21.0398 9.95834C20.6482 9.56671 20.0149 9.56671 19.6274 9.95834C19.24 10.35 19.2358 10.9832 19.6274 11.3707L23.2521 14.9953L12.9989 14.9995C12.4448 14.9995 11.999 15.4453 11.999 15.9994C11.999 16.5535 12.4448 16.9993 12.9989 16.9993H23.2521L19.6274 20.624C19.2358 21.0156 19.2358 21.6489 19.6274 22.0363C20.0191 22.4238 20.6523 22.428 21.0398 22.0363L26.3726 16.7077ZM12.3323 8.6668C12.8864 8.6668 13.3322 8.22101 13.3322 7.66689C13.3322 7.11278 12.8864 6.66699 12.3323 6.66699H8.99932C6.97451 6.66699 5.33301 8.3085 5.33301 10.3333V21.6655C5.33301 23.6903 6.97451 25.3318 8.99932 25.3318H12.3323C12.8864 25.3318 13.3322 24.886 13.3322 24.3319C13.3322 23.7778 12.8864 23.332 12.3323 23.332H8.99932C8.07857 23.332 7.33281 22.5863 7.33281 21.6655V10.3333C7.33281 9.41256 8.07857 8.6668 8.99932 8.6668H12.3323Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_930_2154"
            x="5.33301"
            y="6.66699"
            width="23.333"
            height="20.665"
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
              result="effect1_dropShadow_930_2154"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_930_2154"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

DisconnectIcon.displayName = "DisconnectIcon";
