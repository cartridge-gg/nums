import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const SquareDownIcon = memo(
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
          d="M5.39999 6.00039V18.0004C5.39999 18.3304 5.66999 18.6004 5.99999 18.6004H18C18.33 18.6004 18.6 18.3304 18.6 18.0004V6.00039C18.6 5.67039 18.33 5.40039 18 5.40039H5.99999C5.66999 5.40039 5.39999 5.67039 5.39999 6.00039ZM7.54499 12.3716C7.63874 12.1466 7.85624 12.0004 8.09999 12.0004H10.8V8.10039C10.8 7.60164 11.2012 7.20039 11.7 7.20039H12.3C12.7987 7.20039 13.2 7.60164 13.2 8.10039V12.0004H15.9C16.1437 12.0004 16.3612 12.1466 16.455 12.3716C16.5487 12.5966 16.4962 12.8554 16.3237 13.0241L12.4237 16.9241C12.1912 17.1566 11.8087 17.1566 11.5762 16.9241L7.67624 13.0241C7.50374 12.8516 7.45499 12.5929 7.54499 12.3716Z"
          fill="currentColor"
        />
        <g filter="url(#filter0_d_887_11227)">
          <path
            d="M18 18.5996C18.33 18.5996 18.6 18.3296 18.6 17.9996V5.99961C18.6 5.66961 18.33 5.39961 18 5.39961H6.00001C5.67001 5.39961 5.40001 5.66961 5.40001 5.99961V17.9996C5.40001 18.3296 5.67001 18.5996 6.00001 18.5996H18ZM20.4 17.9996C20.4 19.3234 19.3238 20.3996 18 20.3996H6.00001C4.67626 20.3996 3.60001 19.3234 3.60001 17.9996V5.99961C3.60001 4.67586 4.67626 3.59961 6.00001 3.59961H18C19.3238 3.59961 20.4 4.67586 20.4 5.99961V17.9996ZM11.5763 16.9234L7.67626 13.0234C7.50376 12.8509 7.45501 12.5921 7.54501 12.3709C7.63501 12.1496 7.85626 11.9996 8.10001 11.9996H10.8V8.09961C10.8 7.60086 11.2013 7.19961 11.7 7.19961H12.3C12.7988 7.19961 13.2 7.60086 13.2 8.09961V11.9996H15.9C16.1438 11.9996 16.3613 12.1459 16.455 12.3709C16.5488 12.5959 16.4963 12.8546 16.3238 13.0234L12.4238 16.9234C12.1913 17.1559 11.8088 17.1559 11.5763 16.9234Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_887_11227"
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
              result="effect1_dropShadow_887_11227"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_887_11227"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

SquareDownIcon.displayName = "SquareDownIcon";
