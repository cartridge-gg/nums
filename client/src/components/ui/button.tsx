import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { useAudio } from "@/context/audio";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "select-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-orange-100 text-brown-100 rounded-lg hover:bg-orange-200",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-purple-100 rounded-lg hover:bg-purple-200",
        muted: "bg-purple-600 rounded-lg hover:bg-purple-500",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-1 gap-3",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        sound: "h-12 w-16 px-4 py-2",
        balance: "h-12 w-[172px] px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      style,
      onClick,
      onMouseEnter,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const { playClick } = useAudio();

    const combinedStyle =
      !disabled &&
      (variant === "secondary" || variant === "default" || variant === "muted")
        ? {
            boxShadow:
              "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
            ...style,
          }
        : style;

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
          playClick();
        }
        onClick?.(event);
      },
      [disabled, onClick, playClick],
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={combinedStyle}
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
