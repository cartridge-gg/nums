import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const RefreshIcon = memo(
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
          d="M15.6966 7.40987C14.631 6.48918 13.2414 5.93056 11.7241 5.93056C8.37241 5.93056 5.65517 8.6478 5.65517 11.9995C5.65517 15.3513 8.37241 18.0685 11.7241 18.0685C13.0931 18.0685 14.3517 17.6168 15.3655 16.8547C15.731 16.5788 16.2483 16.6547 16.5241 17.0202C16.8 17.3857 16.7241 17.903 16.3586 18.1788C15.069 19.1478 13.4621 19.7237 11.7241 19.7237C7.45862 19.7237 4 16.265 4 11.9995C4 7.73401 7.45862 4.27539 11.7241 4.27539C13.7 4.27539 15.5034 5.01677 16.869 6.23746L17.9207 5.18574C18.1483 4.95815 18.4586 4.83056 18.7828 4.83056C19.4552 4.82711 20 5.37194 20 6.04436V10.0685C20 10.5271 19.631 10.8961 19.1724 10.8961H15.1483C14.4759 10.8961 13.931 10.3513 13.931 9.67884C13.931 9.3547 14.0586 9.0478 14.2862 8.81677L15.6931 7.40987H15.6966Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

RefreshIcon.displayName = "RefreshIcon";
