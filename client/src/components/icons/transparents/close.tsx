import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CloseIcon = memo(
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
        <g filter="url(#filter0_d_858_10001)">
          <path
            d="M24.8744 22.9501C25.421 23.4952 25.421 24.3796 24.8744 24.9248C24.3278 25.47 23.441 25.4699 22.8944 24.9248L16.001 17.9989L9.05859 24.9225C8.51201 25.4676 7.62519 25.4676 7.07855 24.9225C6.53191 24.3774 6.53197 23.493 7.07855 22.9478L14.0233 16.0265L7.07662 9.05053C6.53004 8.50542 6.53004 7.621 7.07662 7.07584C7.6232 6.53068 8.51002 6.53074 9.05666 7.07584L16.001 14.0541L22.9434 7.13053C23.4899 6.58543 24.3768 6.58543 24.9234 7.13053C25.47 7.67564 25.47 8.56006 24.9234 9.10522L17.9787 16.0265L24.8744 22.9501Z"
            fill="currentColor"
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_858_10001"
            x="6.66669"
            y="6.66699"
            width="20.6667"
            height="20.667"
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
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_858_10001"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_858_10001"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

CloseIcon.displayName = "CloseIcon";
