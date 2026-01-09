import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const BoostHighIcon = memo(
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
        <path
          opacity="0.4"
          d="M6.6001 17.3998V19.7998H9.0001C11.3213 19.7998 13.2001 17.921 13.2001 15.5998V8.69977C13.2001 8.20102 13.6013 7.79977 14.1001 7.79977H15.3526L12.0001 4.44727L8.6476 7.79977H9.9001C10.3988 7.79977 10.8001 8.20102 10.8001 8.69977V16.1998C10.8001 16.8635 10.2638 17.3998 9.6001 17.3998H6.6001Z"
          fill="currentColor"
        />
        <g filter="url(#filter0_d_832_7435)">
          <path
            d="M12 4.44793L8.64749 7.80043H9.89999C10.3987 7.80043 10.8 8.20168 10.8 8.70043V16.2004C10.8 16.8642 10.2637 17.4004 9.59999 17.4004H6.59999V19.8004H8.99999C11.3212 19.8004 13.2 17.9217 13.2 15.6004V8.70043C13.2 8.20168 13.6012 7.80043 14.1 7.80043H15.3525L12 4.44793ZM11.1525 2.75293C11.6212 2.28418 12.3825 2.28418 12.8512 2.75293L17.6512 7.55293C17.9962 7.89793 18.0975 8.41168 17.91 8.86168C17.7225 9.31168 17.2875 9.60418 16.8 9.60418H15V15.6042C15 18.9192 12.315 21.6042 8.99999 21.6042H5.99999C5.33624 21.6042 4.79999 21.0679 4.79999 20.4042V16.8042C4.79999 16.1404 5.33624 15.6042 5.99999 15.6042H8.99999V9.60418H7.19999C6.71624 9.60418 6.27749 9.31168 6.08999 8.86168C5.90249 8.41168 6.00749 7.89793 6.34874 7.55293L11.1487 2.75293H11.1525Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_832_7435"
            x="4.7998"
            y="2.40137"
            width="15.2031"
            height="21.2031"
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
              result="effect1_dropShadow_832_7435"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_832_7435"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

BoostHighIcon.displayName = "BoostHighIcon";
