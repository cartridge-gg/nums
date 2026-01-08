import { forwardRef, memo } from "react";
import { iconVariants, type StateIconProps } from "..";

export const SoundOffIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "solid":
              return (
                <path
                  d="M16.3639 5.96592C16.6833 6.11036 16.8889 6.42703 16.8889 6.77703V17.4437C16.8889 17.7937 16.6833 18.1104 16.3639 18.2548C16.0444 18.3993 15.6694 18.3409 15.4083 18.1076L11.6611 14.777H9.77778C8.79722 14.777 8 13.9798 8 12.9993V11.2215C8 10.2409 8.79722 9.4437 9.77778 9.4437H11.6611L15.4083 6.11314C15.6694 5.87981 16.0444 5.82425 16.3639 5.96592Z"
                  fill="currentColor"
                />
              );
            case "line":
              return (
                <path
                  d="M12.4417 10.6081L15.5556 7.84145V16.3776L12.4417 13.6137C12.3194 13.5053 12.1611 13.4442 12 13.4442H9.55556C9.43333 13.4442 9.33333 13.3442 9.33333 13.222V10.9998C9.33333 10.8776 9.43333 10.7776 9.55556 10.7776H12C12.1639 10.7776 12.3222 10.7164 12.4417 10.6081ZM16.0611 5.88867C15.8583 5.88867 15.6639 5.96367 15.5111 6.09701L11.7472 9.44423H9.55556C8.69722 9.44423 8 10.1414 8 10.9998V13.222C8 14.0803 8.69722 14.7776 9.55556 14.7776H11.7472L15.5111 18.1248C15.6639 18.2581 15.8583 18.3331 16.0611 18.3331C16.5194 18.3331 16.8889 17.9637 16.8889 17.5053V6.71645C16.8889 6.25812 16.5194 5.88867 16.0611 5.88867Z"
                  fill="currentColor"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

SoundOffIcon.displayName = "SoundOffIcon";
