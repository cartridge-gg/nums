import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const SwapIcon = memo(
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
          opacity="0.5"
          d="M10.8 8.39961C10.8 5.74836 12.9487 3.59961 15.6 3.59961C18.2512 3.59961 20.4 5.74836 20.4 8.39961V15.5996H21.735C22.3237 15.5996 22.8 16.0759 22.8 16.6646C22.8 16.9459 22.6875 17.2196 22.4887 17.4184L19.8375 20.0696C19.485 20.4221 18.915 20.4221 18.5662 20.0696L15.915 17.4184C15.7162 17.2196 15.6037 16.9459 15.6037 16.6646C15.6037 16.0759 16.08 15.5996 16.6687 15.5996H18.0037V8.39961C18.0037 7.07586 16.9275 5.99961 15.6037 5.99961C14.28 5.99961 13.2037 7.07586 13.2037 8.39961V11.9996H10.8037V8.39961H10.8Z"
          fill="currentColor"
        />
        <g filter="url(#filter0_d_1655_6690)">
          <path
            d="M5.43751 3.86203C5.08501 3.50953 4.51501 3.50953 4.16626 3.86203L1.51126 6.51328C1.31251 6.71578 1.20001 6.98578 1.20001 7.26703C1.20001 7.85578 1.67626 8.33203 2.26501 8.33203H3.60001V15.5995C3.60001 18.2508 5.74876 20.3995 8.40001 20.3995C11.0513 20.3995 13.2 18.2508 13.2 15.5995V11.9995H10.8V15.5995C10.8 16.9233 9.72376 17.9995 8.40001 17.9995C7.07626 17.9995 6.00001 16.9233 6.00001 15.5995V8.33203H7.33501C7.92376 8.33203 8.40001 7.85578 8.40001 7.26703C8.40001 6.98578 8.28751 6.71203 8.08876 6.51328L5.43751 3.86203Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1655_6690"
            x="1.20001"
            y="3.59766"
            width="14"
            height="18.8018"
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
              result="effect1_dropShadow_1655_6690"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1655_6690"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

SwapIcon.displayName = "SwapIcon";
