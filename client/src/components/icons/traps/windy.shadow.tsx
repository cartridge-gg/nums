import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const WindyShadowIcon = memo(
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
          d="M6.40039 32C6.40039 33.77 7.83039 35.2 9.60039 35.2H48.0004C49.7704 35.2 51.2004 36.63 51.2004 38.4C51.2004 40.17 49.7704 41.6 48.0004 41.6H44.8004C43.0304 41.6 41.6004 43.03 41.6004 44.8C41.6004 46.57 43.0304 48 44.8004 48H48.0004C53.3004 48 57.6004 43.7 57.6004 38.4C57.6004 33.1 53.3004 28.8 48.0004 28.8H9.60039C7.83039 28.8 6.40039 30.23 6.40039 32Z"
          fill="#FFD97D"
        />
        <g filter="url(#filter0_d_2361_13504)">
          <path
            d="M38.4004 6.3999C36.6304 6.3999 35.2004 7.8299 35.2004 9.5999C35.2004 11.3699 36.6304 12.7999 38.4004 12.7999H42.4004C43.7304 12.7999 44.8004 13.8699 44.8004 15.1999C44.8004 16.5299 43.7304 17.5999 42.4004 17.5999H9.60039C7.83039 17.5999 6.40039 19.0299 6.40039 20.7999C6.40039 22.5699 7.83039 23.9999 9.60039 23.9999H42.4004C47.2604 23.9999 51.2004 20.0599 51.2004 15.1999C51.2004 10.3399 47.2604 6.3999 42.4004 6.3999H38.4004ZM19.2004 57.5999H23.2004C28.0604 57.5999 32.0004 53.6599 32.0004 48.7999C32.0004 43.9399 28.0604 39.9999 23.2004 39.9999H9.60039C7.83039 39.9999 6.40039 41.4299 6.40039 43.1999C6.40039 44.9699 7.83039 46.3999 9.60039 46.3999H23.2004C24.5304 46.3999 25.6004 47.4699 25.6004 48.7999C25.6004 50.1299 24.5304 51.1999 23.2004 51.1999H19.2004C17.4304 51.1999 16.0004 52.6299 16.0004 54.3999C16.0004 56.1699 17.4304 57.5999 19.2004 57.5999Z"
            fill="#FFD97D"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2361_13504"
            x="6.40039"
            y="6.3999"
            width="46.8008"
            height="53.2"
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
              result="effect1_dropShadow_2361_13504"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2361_13504"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

WindyShadowIcon.displayName = "WindyShadowIcon";
