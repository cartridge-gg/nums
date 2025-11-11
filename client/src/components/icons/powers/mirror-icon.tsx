import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const MirrorIcon = memo(
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
          d="M4.2002 9.07129V14.9288L7.12895 12L4.2002 9.07129ZM16.8714 12L19.8002 14.9288V9.07504L16.8714 12.0038V12Z"
          fill="#7FC8F8"
        />
        <g filter="url(#filter0_d_832_7414)">
          <path
            d="M11.9999 3.59961C12.4987 3.59961 12.8999 4.00086 12.8999 4.49961V19.4996C12.8999 19.9984 12.4987 20.3996 11.9999 20.3996C11.5012 20.3996 11.0999 19.9984 11.0999 19.4996V4.49961C11.0999 4.00086 11.5012 3.59961 11.9999 3.59961ZM2.9549 6.06711C3.2924 5.92836 3.67865 6.00336 3.9374 6.26211L9.0374 11.3621C9.3899 11.7146 9.3899 12.2846 9.0374 12.6334L3.9374 17.7371C3.67865 17.9959 3.2924 18.0709 2.9549 17.9321C2.6174 17.7934 2.3999 17.4634 2.3999 17.0996V6.89961C2.3999 6.53586 2.6174 6.20586 2.9549 6.06711ZM4.1999 14.9284L7.12865 11.9996L4.1999 9.07086V14.9284ZM20.0624 6.26211C20.3212 6.00336 20.7074 5.92836 21.0449 6.06711C21.3824 6.20586 21.5999 6.53586 21.5999 6.89961V17.0996C21.5999 17.4634 21.3824 17.7934 21.0449 17.9321C20.7074 18.0709 20.3212 17.9959 20.0624 17.7371L14.9624 12.6371C14.6099 12.2846 14.6099 11.7146 14.9624 11.3659L20.0624 6.26211ZM16.8712 11.9996L19.7999 14.9284V9.07461L16.8712 12.0034V11.9996Z"
            fill="#7FC8F8"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_832_7414"
            x="2.3999"
            y="3.59961"
            width="21.2002"
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
              result="effect1_dropShadow_832_7414"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_832_7414"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

MirrorIcon.displayName = "MirrorIcon";
