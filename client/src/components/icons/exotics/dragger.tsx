import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const DraggerIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="32"
        height="264"
        viewBox="0 0 32 264"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M32 20L22 14.2265V25.7735L32 20ZM0 244V245H6.28571V244V243H0V244ZM10.2857 240H11.2857V24H10.2857H9.28572V240H10.2857ZM14.2857 20V21H23V20V19H14.2857V20ZM10.2857 24H11.2857C11.2857 22.3431 12.6289 21 14.2857 21V20V19C11.5243 19 9.28572 21.2386 9.28572 24H10.2857ZM6.28571 244V245C9.04714 245 11.2857 242.761 11.2857 240H10.2857H9.28572C9.28572 241.657 7.94257 243 6.28571 243V244Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

DraggerIcon.displayName = "DraggerIcon";
