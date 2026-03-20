import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ShadowEffect } from "@/components/icons";
import {
  TutorialInstruction,
  type TutorialInstructionProps,
  Close,
} from "@/components/elements";
import { useId } from "react";

export interface TutorialProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tutorialVariants> {
  title?: string;
  instruction: TutorialInstructionProps;
  primaryLabel?: string;
  secondaryLabel?: string;
  onClose?: () => void;
  direction?: "left" | "right" | "up" | "down";
  rotation?: number;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const tutorialVariants = cva(
  "select-none relative flex flex-col p-6 md:p-8 gap-6 max-w-[424px]",
  {
    variants: {
      variant: {
        default:
          "rounded-t-2xl rounded-b-4xl md:rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Tutorial = ({
  title,
  instruction,
  primaryLabel,
  secondaryLabel,
  direction,
  rotation,
  onClose,
  onPrimary,
  onSecondary,
  variant,
  className,
  ...props
}: TutorialProps) => {
  const filterId = useId();

  return (
    <div className={cn(tutorialVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />
      {!!onClose && (
        <>
          <div className="flex items-center justify-between md:hidden">
            <h2
              className="text-[36px]/6 uppercase tracking-wider translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {title || "Tutorial"}
            </h2>
            <Close size="md" onClick={onClose} />
          </div>
          <Close
            size="lg"
            onClick={onClose}
            className="hidden md:flex absolute z-10 top-6 right-6"
          />
        </>
      )}
      {!!title && (
        <>
          {!onClose && (
            <h2
              className="md:hidden text-[36px]/6 uppercase tracking-wider translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {title}
            </h2>
          )}
          <h2
            className="hidden md:block text-[48px]/[33px] uppercase tracking-wider translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {title}
          </h2>
        </>
      )}
      <div className="flex flex-col gap-6">
        <TutorialInstruction
          variant={title ? "default" : "ghost"}
          direction={direction}
          rotation={rotation}
          {...instruction}
        />
        <Button
          variant="default"
          className={cn("h-12", !primaryLabel && "hidden")}
          onClick={onPrimary}
        >
          <span
            className="px-1 text-[28px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            {primaryLabel}
          </span>
        </Button>
        <Button
          variant="secondary"
          className={cn("h-12", !secondaryLabel && "hidden")}
          onClick={onSecondary}
        >
          <span
            className="px-1 text-[28px] tracking-wide translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            {secondaryLabel}
          </span>
        </Button>
      </div>
    </div>
  );
};
