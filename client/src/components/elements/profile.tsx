import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { ControllerIcon } from "@/components/icons";
import { useId } from "react";

export interface ProfileProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof profileVariants> {
  username: string;
}

const profileVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center gap-2",
  {
    variants: {
      variant: {
        default: "bg-mauve-700 hover:bg-mauve-500",
      },
      size: {
        md: "h-10 md:h-12 w-10 md:w-auto md:max-w-48 p-2 md:px-4 tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Profile = ({
  username,
  variant,
  size,
  className,
  ...props
}: ProfileProps) => {
  const filterId = useId();
  return (
    <Button
      variant="muted"
      className={cn(profileVariants({ variant, size, className }))}
      {...props}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0.95)"
            />
          </filter>
        </defs>
      </svg>
      <ControllerIcon
        className="min-w-6 min-h-6"
        style={{ filter: `url(#${filterId})` }}
      />
      <p
        className={cn(
          "translate-y-0.5 text-[22px] md:text-[28px] hidden md:block truncate tracking-wider",
        )}
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        {username}
      </p>
    </Button>
  );
};
