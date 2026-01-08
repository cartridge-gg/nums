import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const RibbonIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          opacity="0.4"
          d="M7.49249 3.82539C7.57874 3.93414 8.47499 5.05914 10.1775 7.20039H13.8262C15.5287 5.05914 16.4212 3.93789 16.5112 3.82539C15.9637 2.94039 14.9962 2.40039 13.9537 2.40039H10.0462C9.00374 2.40039 8.03999 2.94039 7.49249 3.82539Z"
          fill="#7BF1A8"
        />
        <g filter="url(#filter0_d_1644_6049)">
          <path
            d="M15.975 4.49645L16.5075 3.8252C16.7025 4.1477 17.205 4.96895 18.015 6.28895C18.8063 7.5827 18.7013 9.2327 17.7525 10.4139L15.2363 13.5639L18.4688 17.6252C18.675 17.8839 18.6338 18.2589 18.375 18.4689L15.375 20.8689C15.1163 21.0752 14.7375 21.0339 14.5313 20.7752L6.24753 10.4177C5.30253 9.2327 5.19753 7.58645 5.98503 6.2927C6.79503 4.96895 7.29378 4.1477 7.49253 3.82895L8.02503 4.49645L12 9.4952L15.975 4.49645ZM7.61253 15.0077L10.845 19.0502L9.46502 20.7752C9.25877 21.0339 8.88003 21.0752 8.62128 20.8689L5.62128 18.4689C5.36253 18.2627 5.32128 17.8839 5.52753 17.6252L7.61253 15.0077Z"
            fill="#7BF1A8"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1644_6049"
            x="5.39636"
            y="3.8252"
            width="15.2036"
            height="19.1748"
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
              result="effect1_dropShadow_1644_6049"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1644_6049"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

RibbonIcon.displayName = "RibbonIcon";
