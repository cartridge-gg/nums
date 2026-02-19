import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const UfoShadowIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          opacity="0.4"
          d="M16 28.51C16 28.51 20.71 33.6 32 33.6C43.29 33.6 48 28.51 48 28.51C48 27.1 47.84 25.74 47.55 24.43C45.85 16.84 39.53 11.21 32 11.21C24.47 11.21 18.14 16.84 16.45 24.42C16.16 25.73 16 27.1 16 28.5V28.51Z"
          fill="#7BF1A8"
        />
        <g filter="url(#filter0_d_2361_13482)">
          <path
            d="M31.9992 33.5999C43.2892 33.5999 47.9992 28.5099 47.9992 28.5099C47.9992 27.0999 47.8392 25.7399 47.5492 24.4299C55.5192 26.7099 60.7992 30.6799 60.7992 35.2099C60.7992 42.2799 47.9092 48.0099 31.9992 48.0099C16.0892 48.0099 3.19922 42.2699 3.19922 35.1999C3.19922 30.6799 8.47922 26.6999 16.4492 24.4199C16.1592 25.7299 15.9992 27.0999 15.9992 28.4999C15.9992 28.4999 20.7092 33.5899 31.9992 33.5899V33.5999ZM34.3992 39.9999C34.3992 38.6699 33.3292 37.5999 31.9992 37.5999C30.6692 37.5999 29.5992 38.6699 29.5992 39.9999C29.5992 41.3299 30.6692 42.3999 31.9992 42.3999C33.3292 42.3999 34.3992 41.3299 34.3992 39.9999ZM15.1992 39.1999C16.5292 39.1999 17.5992 38.1299 17.5992 36.7999C17.5992 35.4699 16.5292 34.3999 15.1992 34.3999C13.8692 34.3999 12.7992 35.4699 12.7992 36.7999C12.7992 38.1299 13.8692 39.1999 15.1992 39.1999ZM51.1992 36.7999C51.1992 35.4699 50.1292 34.3999 48.7992 34.3999C47.4692 34.3999 46.3992 35.4699 46.3992 36.7999C46.3992 38.1299 47.4692 39.1999 48.7992 39.1999C50.1292 39.1999 51.1992 38.1299 51.1992 36.7999Z"
            fill="#7BF1A8"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2361_13482"
            x="3.19922"
            y="24.4199"
            width="59.5996"
            height="25.5901"
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
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_2361_13482"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2361_13482"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

UfoShadowIcon.displayName = "UfoShadowIcon";
