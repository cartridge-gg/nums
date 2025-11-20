import { forwardRef, memo } from "react";
import type { StateIconProps } from "../types";
import { iconVariants } from "../utils";

export const EyeIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g filter="url(#filter0_d_1280_5195)">
          <path
            d="M11.9986 5.77832C9.75436 5.77832 7.9573 6.80045 6.64908 8.01701C5.34919 9.22247 4.47982 10.6668 4.06874 11.6584C3.97709 11.8778 3.97709 12.1222 4.06874 12.3416C4.47982 13.3332 5.34919 14.7775 6.64908 15.983C7.9573 17.1996 9.75436 18.2217 11.9986 18.2217C14.2429 18.2217 16.0399 17.1996 17.3481 15.983C18.648 14.7748 19.5174 13.3332 19.9313 12.3416C20.0229 12.1222 20.0229 11.8778 19.9313 11.6584C19.5174 10.6668 18.648 9.22247 17.3481 8.01701C16.0399 6.80045 14.2429 5.77832 11.9986 5.77832ZM7.99896 12C7.99896 10.9392 8.42035 9.9219 9.17043 9.17182C9.92051 8.42174 10.9378 8.00035 11.9986 8.00035C13.0594 8.00035 14.0767 8.42174 14.8268 9.17182C15.5769 9.9219 15.9983 10.9392 15.9983 12C15.9983 13.0608 15.5769 14.0781 14.8268 14.8282C14.0767 15.5783 13.0594 15.9997 11.9986 15.9997C10.9378 15.9997 9.92051 15.5783 9.17043 14.8282C8.42035 14.0781 7.99896 13.0608 7.99896 12ZM11.9986 10.2224C11.9986 11.2028 11.2015 12 10.221 12C10.0238 12 9.83491 11.9667 9.65715 11.9083C9.50438 11.8583 9.32662 11.9528 9.33218 12.1139C9.34051 12.3055 9.36828 12.4972 9.42106 12.6888C9.80158 14.1109 11.2653 14.9553 12.6874 14.5748C14.1095 14.1943 14.9539 12.7305 14.5734 11.3084C14.2651 10.1557 13.2457 9.38079 12.1125 9.33357C11.9514 9.32801 11.857 9.503 11.907 9.65854C11.9653 9.8363 11.9986 10.0252 11.9986 10.2224Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1280_5195"
            x="4"
            y="5.77832"
            width="18"
            height="14.4434"
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
              result="effect1_dropShadow_1280_5195"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1280_5195"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  ),
);

EyeIcon.displayName = "EyeIcon";
