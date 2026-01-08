import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const SquareUpIcon = memo(
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
          d="M5.39999 6.00039V18.0004C5.39999 18.3304 5.66999 18.6004 5.99999 18.6004H18C18.33 18.6004 18.6 18.3304 18.6 18.0004V6.00039C18.6 5.67039 18.33 5.40039 18 5.40039H5.99999C5.66999 5.40039 5.39999 5.67039 5.39999 6.00039ZM7.54499 11.6291C7.45124 11.4041 7.50374 11.1454 7.67624 10.9766L11.5762 7.07664C11.8087 6.84414 12.1912 6.84414 12.4237 7.07664L16.3237 10.9766C16.4962 11.1491 16.545 11.4079 16.455 11.6291C16.365 11.8504 16.1437 12.0004 15.9 12.0004H13.2V15.9004C13.2 16.3991 12.7987 16.8004 12.3 16.8004H11.7C11.2012 16.8004 10.8 16.3991 10.8 15.9004V12.0004H8.09999C7.85624 12.0004 7.63874 11.8541 7.54499 11.6291Z"
          fill="#B2F7EF"
        />
        <g filter="url(#filter0_d_887_11230)">
          <path
            d="M6.00001 5.39961C5.67001 5.39961 5.40001 5.66961 5.40001 5.99961V17.9996C5.40001 18.3296 5.67001 18.5996 6.00001 18.5996H18C18.33 18.5996 18.6 18.3296 18.6 17.9996V5.99961C18.6 5.66961 18.33 5.39961 18 5.39961H6.00001ZM3.60001 5.99961C3.60001 4.67586 4.67626 3.59961 6.00001 3.59961H18C19.3238 3.59961 20.4 4.67586 20.4 5.99961V17.9996C20.4 19.3234 19.3238 20.3996 18 20.3996H6.00001C4.67626 20.3996 3.60001 19.3234 3.60001 17.9996V5.99961ZM12.4238 7.07586L16.3238 10.9759C16.4963 11.1484 16.545 11.4071 16.455 11.6284C16.365 11.8496 16.1438 11.9996 15.9 11.9996H13.2V15.8996C13.2 16.3984 12.7988 16.7996 12.3 16.7996H11.7C11.2013 16.7996 10.8 16.3984 10.8 15.8996V11.9996H8.10001C7.85626 11.9996 7.63876 11.8534 7.54501 11.6284C7.45126 11.4034 7.50376 11.1446 7.67626 10.9759L11.5763 7.07586C11.8088 6.84336 12.1913 6.84336 12.4238 7.07586Z"
            fill="#B2F7EF"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_887_11230"
            x="3.60001"
            y="3.59961"
            width="18.8"
            height="18.7998"
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
              result="effect1_dropShadow_887_11230"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_887_11230"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

SquareUpIcon.displayName = "SquareUpIcon";
