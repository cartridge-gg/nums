import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const PointsIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g filter="url(#filter0_d_1016_9653)">
          <path
            d="M12.9793 3.61357C12.7986 3.23861 12.4168 3 11.9976 3C11.5783 3 11.1999 3.23861 11.0158 3.61357L8.82403 8.12332L3.9291 8.84597C3.52005 8.90732 3.17918 9.19366 3.05305 9.58566C2.92693 9.97766 3.02919 10.4106 3.32234 10.7003L6.87424 14.2147L6.03569 19.1812C5.96752 19.5903 6.13795 20.0061 6.47542 20.2482C6.81288 20.4902 7.25942 20.5209 7.62756 20.3266L12.001 17.9916L16.3744 20.3266C16.7425 20.5209 17.189 20.4936 17.5265 20.2482C17.864 20.0027 18.0344 19.5903 17.9662 19.1812L17.1243 14.2147L20.6762 10.7003C20.9693 10.4106 21.075 9.97766 20.9455 9.58566C20.8159 9.19366 20.4785 8.90732 20.0694 8.84597L15.1711 8.12332L12.9793 3.61357Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1016_9653"
            x="3"
            y="3"
            width="20"
            height="19.4551"
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
              result="effect1_dropShadow_1016_9653"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1016_9653"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

PointsIcon.displayName = "PointsIcon";
