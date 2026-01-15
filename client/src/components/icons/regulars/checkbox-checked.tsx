import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CheckboxCheckedIcon = memo(
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
          d="M6.28571 5.14286C5.65357 5.14286 5.14286 5.65357 5.14286 6.28571V17.7143C5.14286 18.3464 5.65357 18.8571 6.28571 18.8571H17.7143C18.3464 18.8571 18.8571 18.3464 18.8571 17.7143V6.28571C18.8571 5.65357 18.3464 5.14286 17.7143 5.14286H6.28571ZM4 6.28571C4 5.025 5.025 4 6.28571 4H17.7143C18.975 4 20 5.025 20 6.28571V17.7143C20 18.975 18.975 20 17.7143 20H6.28571C5.025 20 4 18.975 4 17.7143V6.28571Z"
          fill="currentColor"
        />
        <path
          d="M11.2609 14.6892L15.8323 10.1177C16.0537 9.89632 16.0537 9.53203 15.8323 9.3106C15.6109 9.08917 15.2466 9.08917 15.0252 9.3106L10.8573 13.4785L8.97517 11.5963C8.75374 11.3749 8.38945 11.3749 8.16802 11.5963C7.9466 11.8177 7.9466 12.182 8.16802 12.4035L10.4537 14.6892C10.6752 14.9106 11.0395 14.9106 11.2609 14.6892Z"
          fill="var(--green-100)"
        />
      </svg>
    ),
  ),
);

CheckboxCheckedIcon.displayName = "CheckboxCheckedIcon";
