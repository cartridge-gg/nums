import * as icons from "@/components/icons";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface StageState {
  completed?: boolean;
  breakeven?: boolean;
  gem?: boolean;
  crown?: boolean;
}

interface StageStateConfig {
  className: string;
  icon: React.ReactNode | null;
}

const getStageState = (state: StageState): StageStateConfig => {
  const {
    completed = false,
    breakeven = false,
    gem = false,
    crown = false,
  } = state;
  if (completed && crown) {
    return {
      className: "bg-pink-600 text-pink-100",
      icon: <icons.KingUsedIcon size="sm" />,
    };
  }
  if (crown) {
    return {
      className: "bg-pink-600 text-pink-100",
      icon: <icons.KingIcon size="sm" />,
    };
  }
  if (breakeven && completed && gem) {
    return {
      className: "bg-green-600 text-green-100",
      icon: <icons.GemUsedIcon size="sm" />,
    };
  }
  if (breakeven && completed) {
    return {
      className: "bg-green-600 text-green-100",
      icon: <icons.CheckIcon size="sm" />,
    };
  }
  if (breakeven && gem) {
    return {
      className: "bg-green-600 text-green-100",
      icon: <icons.GemIcon size="sm" />,
    };
  }
  if (breakeven) {
    return {
      className: "bg-green-600 text-green-100",
      icon: <div className="h-4 w-4" />,
    };
  }
  if (completed && gem) {
    return {
      className: "bg-black-900 text-yellow-100",
      icon: <icons.GemUsedIcon size="sm" />,
    };
  }
  if (gem) {
    return {
      className: "bg-black-800 text-yellow-100",
      icon: <icons.GemIcon size="sm" />,
    };
  }
  if (completed) {
    return {
      className: "bg-black-900 text-mauve-100",
      icon: <icons.CheckIcon size="sm" />,
    };
  }
  return { className: "bg-black-800", icon: <div className="h-4 w-4" /> };
};

export interface StageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stageVariants> {
  state?: StageState;
}

const stageVariants = cva(
  "select-none relative rounded flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Stage = ({
  state,
  variant,
  size,
  className,
  ...props
}: StageProps) => {
  const { className: stateClassName, icon: Icon } = getStageState(state || {});

  return (
    <div
      className={cn(
        stageVariants({ variant, size, className }),
        stateClassName,
      )}
      {...props}
    >
      {Icon}
    </div>
  );
};
