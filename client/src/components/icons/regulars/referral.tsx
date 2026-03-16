import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const ReferralIcon = memo(
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
          d="M19.1358 4.09087C19.5068 4.25541 19.7423 4.62322 19.7423 5.02974V18.4514C19.7423 18.8579 19.5068 19.2257 19.1358 19.3902C18.7648 19.5548 18.3356 19.4935 18.0291 19.2257L16.5257 17.9126C15.119 16.6833 13.3413 15.9671 11.4797 15.88V18.9676C11.4797 19.5386 11.0183 20 10.4472 20H9.41479C8.84373 20 8.38236 19.5386 8.38236 18.9676V15.8703C6.10456 15.8703 4.25586 14.0216 4.25586 11.7405C4.25586 9.45952 6.10456 7.61082 8.38559 7.61082H11.1119C13.1057 7.60436 15.0286 6.87844 16.5289 5.56854L18.0324 4.25541C18.3356 3.98763 18.7712 3.92633 19.139 4.09087H19.1358ZM11.4829 13.8054V13.8119C13.751 13.899 15.9288 14.7314 17.6775 16.18V7.29786C15.9288 8.74649 13.751 9.57889 11.4829 9.666V13.8054Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ReferralIcon.displayName = "ReferralIcon";
