import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const MagnetShadowIcon = memo(
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
          d="M9.59961 12.8001V22.4001H22.3996V12.8001C22.3996 11.0301 20.9696 9.6001 19.1996 9.6001H12.7996C11.0296 9.6001 9.59961 11.0301 9.59961 12.8001ZM41.5996 12.8001V22.4001H54.3996V12.8001C54.3996 11.0301 52.9696 9.6001 51.1996 9.6001H44.7996C43.0296 9.6001 41.5996 11.0301 41.5996 12.8001Z"
          fill="#FF9B85"
        />
        <g filter="url(#filter0_d_2361_13438)">
          <path
            d="M9.59961 22.3999V35.1999C9.59961 47.5699 19.6296 57.5999 31.9996 57.5999C44.3696 57.5999 54.3996 47.5699 54.3996 35.1999V22.3999H41.5996V35.1999C41.5996 40.4999 37.2996 44.7999 31.9996 44.7999C26.6996 44.7999 22.3996 40.4999 22.3996 35.1999V22.3999H9.59961Z"
            fill="#FF9B85"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2361_13438"
            x="9.59961"
            y="22.3999"
            width="46.8008"
            height="37.2"
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
              result="effect1_dropShadow_2361_13438"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2361_13438"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

MagnetShadowIcon.displayName = "MagnetShadowIcon";
