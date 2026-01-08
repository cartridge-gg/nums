import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const CloseIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 32 32"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M24.8742 22.9499C25.4208 23.495 25.4208 24.3794 24.8742 24.9246C24.3276 25.4697 23.4408 25.4697 22.8942 24.9246L16.0008 17.9986L9.0584 24.9222C8.51182 25.4673 7.62501 25.4673 7.07837 24.9222C6.53173 24.3771 6.53178 23.4927 7.07837 22.9476L14.0231 16.0263L7.07644 9.05028C6.52986 8.50518 6.52986 7.62076 7.07644 7.0756C7.62302 6.53044 8.50984 6.53049 9.05648 7.0756L16.0008 14.0539L22.9432 7.13029C23.4898 6.58518 24.3766 6.58518 24.9232 7.13029C25.4699 7.67539 25.4698 8.55981 24.9232 9.10497L17.9785 16.0263L24.8742 22.9499Z"
          fill="currentColor"
          shapeRendering="crispEdges"
        />
      </svg>
    ),
  ),
);

CloseIcon.displayName = "CloseIcon";
