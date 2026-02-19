import { forwardRef, memo } from "react";
import { animationVariants, type AnimationProps } from ".";
import { cn } from "@/lib/utils";

export const Countdown = memo(
  forwardRef<HTMLImageElement, AnimationProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <img
        src="/assets/animations/countdown.svg"
        alt="Countdown animation"
        className={cn(animationVariants({ size, className }))}
        ref={forwardedRef}
        {...props}
      />
    ),
  ),
);

Countdown.displayName = "Countdown";
