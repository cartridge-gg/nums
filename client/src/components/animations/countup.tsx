import { forwardRef, memo } from "react";
import { animationVariants, type AnimationProps } from ".";
import { cn } from "@/lib/utils";

export const Countup = memo(
  forwardRef<HTMLImageElement, AnimationProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <img
        src="/assets/animations/countup.svg"
        alt="Countup animation"
        className={cn(animationVariants({ size, className }))}
        ref={forwardedRef}
        {...props}
      />
    ),
  ),
);

Countup.displayName = "Countup";
