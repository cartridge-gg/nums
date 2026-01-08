import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const EraseIcon = memo(
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
          d="M9.25876 7.3877L12.3375 4.30895C12.4088 4.2377 12.5025 4.2002 12.6 4.2002C12.6975 4.2002 12.795 4.2377 12.8625 4.30895L19.6913 11.1377C19.7625 11.2089 19.8 11.3027 19.8 11.4002C19.8 11.4977 19.7625 11.5952 19.6913 11.6627L16.6125 14.7414L9.25876 7.3877Z"
          fill="#FF86C8"
        />
        <g filter="url(#filter0_d_887_11239)">
          <path
            d="M19.6913 11.6629C19.7625 11.5916 19.8 11.4979 19.8 11.4004C19.8 11.3029 19.7625 11.2054 19.6913 11.1379L12.8625 4.30914C12.7913 4.23789 12.6975 4.20039 12.6 4.20039C12.5025 4.20039 12.405 4.23789 12.3375 4.30914L9.25876 7.38789L16.6125 14.7416L19.6913 11.6629L20.9625 12.9379L15.3 18.6004H20.7C21.1988 18.6004 21.6 19.0016 21.6 19.5004C21.6 19.9991 21.1988 20.4004 20.7 20.4004H7.89376C7.25626 20.4004 6.64501 20.1491 6.19501 19.6991L1.83751 15.3379C1.42876 14.9291 1.20001 14.3779 1.20001 13.8004C1.20001 13.2229 1.42876 12.6716 1.83751 12.2629L11.0625 3.03789C11.4713 2.62914 12.0225 2.40039 12.6 2.40039C13.1775 2.40039 13.7288 2.62914 14.1375 3.03789L20.9625 9.86289C21.3713 10.2716 21.6 10.8229 21.6 11.4004C21.6 11.9779 21.3713 12.5291 20.9625 12.9379L19.6913 11.6629ZM15.3413 16.0129L7.98751 8.65914L3.10876 13.5379C3.03751 13.6091 3.00001 13.7029 3.00001 13.8004C3.00001 13.8979 3.03751 13.9954 3.10876 14.0629L7.47001 18.4241C7.58251 18.5366 7.73626 18.6004 7.89376 18.6004H12.5063C12.6638 18.6004 12.8175 18.5366 12.93 18.4241L15.3413 16.0129Z"
            fill="#FF86C8"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_887_11239"
            x="1.20001"
            y="2.40039"
            width="22.4"
            height="20"
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
              result="effect1_dropShadow_887_11239"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_887_11239"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

EraseIcon.displayName = "EraseIcon";
