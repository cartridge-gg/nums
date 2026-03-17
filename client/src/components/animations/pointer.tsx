import { forwardRef, memo, useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import { animationVariants } from ".";
import { cn } from "@/lib/utils";

const COLS = 4;
const ROWS = 4;
const TOTAL_FRAMES = COLS * ROWS;
const DEFAULT_FPS = 6;
const ALL_FRAMES = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);

export interface PointerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof animationVariants> {
  fps?: number;
  playing?: boolean;
  flipped?: boolean;
  frames?: number[];
}

export const Pointer = memo(
  forwardRef<HTMLDivElement, PointerProps>(
    (
      {
        className,
        size,
        fps = DEFAULT_FPS,
        playing = true,
        flipped = false,
        frames = ALL_FRAMES,
        style,
        ...props
      },
      ref,
    ) => {
      const [index, setIndex] = useState(0);

      useEffect(() => {
        if (!playing || frames.length === 0) return;
        const interval = setInterval(() => {
          setIndex((prev) => (prev + 1) % frames.length);
        }, 1000 / fps);
        return () => clearInterval(interval);
      }, [fps, playing, frames.length]);

      // Spritesheet order: left-to-right, bottom-to-top
      // Frame 0 = bottom-left, Frame 15 = top-right
      const frame = frames[index % frames.length] ?? 0;
      const col = frame % COLS;
      const row = ROWS - 1 - Math.floor(frame / COLS);

      const bgX = COLS > 1 ? (col / (COLS - 1)) * 100 : 0;
      const bgY = ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0;

      return (
        <div
          ref={ref}
          role="img"
          aria-label="Pointer"
          className={cn(animationVariants({ size, className }))}
          style={{
            backgroundImage: "url(/assets/animations/pointer.png)",
            backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            transform: flipped ? "scaleX(-1)" : undefined,
            ...style,
          }}
          {...props}
        />
      );
    },
  ),
);

Pointer.displayName = "Pointer";
