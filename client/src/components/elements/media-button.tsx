import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { FrownIcon, ShadowEffect, SmileIcon } from "@/components/icons";
import { useId } from "react";
import { useTheme } from "@/context/theme";

export interface MediaButtonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mediaButtonVariants> {}

const mediaButtonVariants = cva(
  "flex items-center justify-center p-2 h-12 w-12 rounded-full transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-secondary-100 hover:bg-secondary-200 text-white-100 hover:text-white-200 shadow-[1px_1px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_rgba(255,255,255,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const MediaButton = ({
  variant,
  className,
  ...props
}: MediaButtonProps) => {
  const filterId = useId();
  const { theme } = useTheme();

  return (
    <div className={cn(mediaButtonVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />
      {theme === "compliant" ? (
        <SmileIcon size="lg" style={{ filter: `url(#${filterId})` }} />
      ) : (
        <FrownIcon size="lg" style={{ filter: `url(#${filterId})` }} />
      )}
    </div>
  );
};
