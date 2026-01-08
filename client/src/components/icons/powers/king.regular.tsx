import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const KingIcon = memo(
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
        <g clipPath="url(#clip0_1608_6047)">
          <path
            opacity="0.4"
            d="M5.11877 10.0683L6.22877 16.1658C6.36002 16.8783 6.97877 17.3958 7.70627 17.3958H16.3013C17.025 17.3958 17.6475 16.8783 17.7788 16.1658L18.8888 10.0683L16.0313 11.5908C15.6225 11.8083 15.1163 11.6808 14.8575 11.2945L12.0075 7.01953L9.15752 11.2945C8.90252 11.6808 8.39252 11.8083 7.98377 11.5908L5.12627 10.0683H5.11877Z"
            fill="#FF86C8"
          />
          <g filter="url(#filter0_d_1608_6047)">
            <path
              d="M13.1362 5.47875C13.365 5.21625 13.5 4.875 13.5 4.5C13.5 3.67125 12.8287 3 12 3C11.1712 3 10.5 3.67125 10.5 4.5C10.5 4.875 10.6387 5.21625 10.8637 5.47875L8.10374 9.6225L4.76249 7.84125C4.78874 7.7325 4.79999 7.62 4.79999 7.5C4.79999 6.67125 4.12874 6 3.29999 6C2.47124 6 1.79999 6.67125 1.79999 7.5C1.79999 8.2575 2.36249 8.88375 3.08999 8.985L4.45499 16.4888C4.73999 18.0563 6.10874 19.2 7.70249 19.2H16.2975C17.8912 19.2 19.26 18.06 19.545 16.4888L20.91 8.985C21.6412 8.88375 22.2 8.2575 22.2 7.5C22.2 6.67125 21.5287 6 20.7 6C19.8712 6 19.2 6.67125 19.2 7.5C19.2 7.61625 19.215 7.72875 19.2375 7.84125L15.8962 9.6225L13.1362 5.4825V5.47875ZM9.14999 11.2987L12 7.02375L14.85 11.2987C15.105 11.685 15.615 11.8125 16.0237 11.595L18.8812 10.0725L17.7712 16.17C17.64 16.8825 17.0212 17.4 16.2937 17.4H7.69874C6.97499 17.4 6.35249 16.8825 6.22124 16.17L5.11124 10.0725L7.96874 11.595C8.37749 11.8125 8.88374 11.685 9.14249 11.2987H9.14999Z"
              fill="#FF86C8"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_d_1608_6047"
            x="1.79999"
            y="3"
            width="22.4"
            height="18.2002"
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
              result="effect1_dropShadow_1608_6047"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1608_6047"
              result="shape"
            />
          </filter>
          <clipPath id="clip0_1608_6047">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  ),
);

KingIcon.displayName = "KingIcon";
