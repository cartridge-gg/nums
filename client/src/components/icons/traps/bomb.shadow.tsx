import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const BombShadowIcon = memo(
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
          d="M43.1992 12.8C43.1992 13.49 43.6392 14.1 44.2892 14.32L48.3292 15.67L49.6792 19.71C49.8992 20.36 50.5092 20.8 51.1992 20.8C51.8892 20.8 52.4992 20.36 52.7192 19.71L54.0692 15.67L58.1092 14.32C58.7592 14.1 59.1992 13.49 59.1992 12.8C59.1992 12.11 58.7592 11.5 58.1092 11.28L54.0592 9.94005L52.7192 5.89005C52.4992 5.24005 51.8892 4.80005 51.1992 4.80005C50.5092 4.80005 49.8992 5.24005 49.6792 5.89005L48.3292 9.93005L44.2892 11.28C43.6392 11.5 43.1992 12.11 43.1992 12.8Z"
          fill="#F77272"
        />
        <g filter="url(#filter0_d_2361_13471)">
          <path
            d="M35.3404 16.1399C36.5904 14.8899 38.6204 14.8899 39.8704 16.1399L47.8704 24.1399C49.1204 25.3899 49.1204 27.4199 47.8704 28.6699L46.7804 29.7599C47.5704 31.9599 48.0004 34.3299 48.0004 36.8099C48.0004 48.2999 38.6904 57.6099 27.2004 57.6099C15.7104 57.6099 6.40039 48.2899 6.40039 36.7999C6.40039 25.3099 15.7104 15.9999 27.2004 15.9999C29.6704 15.9999 32.0504 16.4299 34.2504 17.2299L35.3404 16.1399ZM17.6004 36.7999C17.6004 31.4999 21.9004 27.1999 27.2004 27.1999C28.5304 27.1999 29.6004 26.1299 29.6004 24.7999C29.6004 23.4699 28.5304 22.3999 27.2004 22.3999C19.2504 22.3999 12.8004 28.8499 12.8004 36.7999C12.8004 38.1299 13.8704 39.1999 15.2004 39.1999C16.5304 39.1999 17.6004 38.1299 17.6004 36.7999Z"
            fill="#F77272"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2361_13471"
            x="6.40039"
            y="15.2024"
            width="44.4082"
            height="44.4075"
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
              result="effect1_dropShadow_2361_13471"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2361_13471"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

BombShadowIcon.displayName = "BombShadowIcon";
