import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const AngleIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <rect width="20" height="20" rx="4" fill="white" fillOpacity="0.04" />
        <path
          d="M10.7862 4.94013C10.9496 4.62406 10.8263 4.23567 10.5129 4.07227C10.1996 3.90888 9.81116 4.03209 9.64508 4.34549L4.07363 15.0598C3.96917 15.258 3.9772 15.4991 4.09506 15.6893C4.21292 15.8795 4.41917 16 4.64417 16H15.3585C15.7148 16 16.0014 15.7134 16.0014 15.3571C16.0014 15.0009 15.7148 14.7143 15.3585 14.7143H5.70221L10.7862 4.94013ZM13.3094 11.4652C13.1594 11.1223 12.7388 11.0098 12.4201 11.2053C12.1335 11.3821 12.0344 11.7491 12.1656 12.0598C12.3505 12.4964 12.4978 12.9545 12.6022 13.4286H13.9147C13.7862 12.7455 13.5826 12.0866 13.3094 11.4652ZM10.8612 9.96515C11.0808 10.2196 11.4531 10.2946 11.7397 10.1152C12.0585 9.91694 12.1442 9.48837 11.9031 9.20176C11.5254 8.75711 11.1076 8.34729 10.6549 7.97765L10.0469 9.14551C10.3388 9.3973 10.6094 9.67051 10.8612 9.96248V9.96515Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

AngleIcon.displayName = "AngleIcon";
