import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Mascot, Pointer } from "@/components/animations";

export interface TutorialInstructionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tutorialInstructionVariants> {
  title: string;
  content: string;
  direction?: "left" | "right" | "up" | "down";
  rotation?: number;
}

const tutorialInstructionVariants = cva("flex gap-3", {
  variants: {
    variant: {
      default:
        "rounded-lg p-3 border-2 border-mauve-700 bg-mauve-800 backdrop-blur-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const TutorialInstruction = ({
  title,
  content,
  direction,
  rotation: rotationOverride,
  variant,
  className,
  ...props
}: TutorialInstructionProps) => {
  return (
    <div
      className={cn(
        tutorialInstructionVariants({ variant, className }),
        direction === "right" && "flex-row-reverse",
      )}
      {...props}
    >
      {direction ? (
        <Pointer
          size="3xl"
          rotation={
            rotationOverride !== undefined
              ? rotationOverride
              : direction === "right"
                ? 0
                : direction === "left"
                  ? 180
                  : direction === "up"
                    ? -90
                    : 90
          }
          frames={[8, 9, 10, 11, 4, 5, 6, 7, 6, 5, 4, 11, 10, 9]}
          className="min-w-16 min-h-16"
        />
      ) : (
        <Mascot size="3xl" flipped className="min-w-16 min-h-16" />
      )}
      <div className="flex flex-col gap-3">
        <span
          className={cn(
            "font-primary text-lg/5 translate-y-0.5 text-mauve-100 tracking-wider md:whitespace-nowrap",
            variant === "ghost" && " text-[28px]/5",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "font-sans text-sm/[18px] text-white-400",
            variant === "ghost" && "text-base/5",
          )}
        >
          {content.split(/\*\*(.+?)\*\*/).map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="text-white-100">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
      </div>
    </div>
  );
};
