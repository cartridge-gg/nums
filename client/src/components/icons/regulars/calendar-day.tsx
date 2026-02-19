import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CalendarDayIcon = memo(
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
          d="M8.39961 2.40039C9.06336 2.40039 9.59961 2.93664 9.59961 3.60039V4.80039H14.3996V3.60039C14.3996 2.93664 14.9359 2.40039 15.5996 2.40039C16.2634 2.40039 16.7996 2.93664 16.7996 3.60039V4.80039H17.9996C19.3234 4.80039 20.3996 5.87664 20.3996 7.20039V18.0004C20.3996 19.3241 19.3234 20.4004 17.9996 20.4004H5.99961C4.67586 20.4004 3.59961 19.3241 3.59961 18.0004V7.20039C3.59961 5.87664 4.67586 4.80039 5.99961 4.80039H7.19961V3.60039C7.19961 2.93664 7.73586 2.40039 8.39961 2.40039ZM8.39961 12.0004C7.73586 12.0004 7.19961 12.5366 7.19961 13.2004V15.6004C7.19961 16.2641 7.73586 16.8004 8.39961 16.8004H10.7996C11.4634 16.8004 11.9996 16.2641 11.9996 15.6004V13.2004C11.9996 12.5366 11.4634 12.0004 10.7996 12.0004H8.39961Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

CalendarDayIcon.displayName = "CalendarDayIcon";
