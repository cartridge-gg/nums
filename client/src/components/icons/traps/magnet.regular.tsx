import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const MagnetIcon = memo(
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
          d="M3.59961 4.8001V8.4001H8.39961V4.8001C8.39961 4.13635 7.86336 3.6001 7.19961 3.6001H4.79961C4.13586 3.6001 3.59961 4.13635 3.59961 4.8001ZM15.5996 4.8001V8.4001H20.3996V4.8001C20.3996 4.13635 19.8634 3.6001 19.1996 3.6001H16.7996C16.1359 3.6001 15.5996 4.13635 15.5996 4.8001Z"
          fill="#FF9B85"
        />
        <path
          d="M3.59961 8.3999V13.1999C3.59961 17.8387 7.36086 21.5999 11.9996 21.5999C16.6384 21.5999 20.3996 17.8387 20.3996 13.1999V8.3999H15.5996V13.1999C15.5996 15.1874 13.9871 16.7999 11.9996 16.7999C10.0121 16.7999 8.39961 15.1874 8.39961 13.1999V8.3999H3.59961Z"
          fill="#FF9B85"
        />
      </svg>
    ),
  ),
);

MagnetIcon.displayName = "MagnetIcon";
