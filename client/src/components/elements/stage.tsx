import * as icons from "@/components/icons";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface StageState {
  completed?: boolean;
  breakeven?: boolean;
  gem?: boolean;
  crown?: boolean;
  unlocked?: boolean;
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
    unlocked = false,
  } = state;

  const border = breakeven
    ? completed
      ? "border border-[color-mix(in_srgb,var(--green-600)_50%,var(--black-900)_50%)]"
      : "border border-green-400"
    : completed
      ? "border border-[color-mix(in_srgb,var(--black-900)_50%,var(--black-900)_50%)]"
      : "border border-[color-mix(in_srgb,var(--black-800)_50%,var(--black-900)_50%)]";

  const bg = completed
    ? breakeven
      ? "bg-green-600"
      : "bg-black-900"
    : "bg-black-800";

  const text =
    completed && breakeven && unlocked
      ? "text-green-100"
      : (completed && breakeven) || gem || crown
        ? "text-yellow-100"
        : completed
          ? "text-primary-100"
          : "";

  let icon: React.ReactNode;
  if (crown) {
    icon = unlocked ? (
      <icons.KingUsedIcon size="sm" />
    ) : (
      <icons.KingIcon size="sm" />
    );
  } else if (gem) {
    icon = unlocked ? (
      <icons.GemUsedIcon size="sm" />
    ) : (
      <icons.GemIcon size="sm" />
    );
  } else {
    icon = unlocked ? (
      <icons.CheckIcon size="sm" />
    ) : (
      <div className="h-4 w-4" />
    );
  }

  return {
    className: `${bg} ${text} ${border}`,
    icon,
  };
};

const getOverState = (state: StageState): StageStateConfig => {
  const {
    completed = false,
    breakeven = false,
    gem = false,
    crown = false,
    unlocked: _unlocked = true,
  } = state;
  if (breakeven && completed && crown) {
    return {
      className:
        "bg-green-600 text-green-100 border border-[color-mix(in_srgb,var(--green-600)_50%,var(--white-900)_50%)]",
      icon: <icons.KingUsedIcon size="sm" />,
    };
  }
  if (completed && crown) {
    return {
      className: "bg-black-800 text-yellow-100 border-white-900",
      icon: <icons.KingUsedIcon size="sm" />,
    };
  }
  if (crown) {
    return {
      className:
        "bg-red-800 text-red-100 border-[color-mix(in_srgb,var(--red-800)_50%,var(--white-900)_50%)]",
      icon: <icons.KingIcon size="sm" />,
    };
  }
  if (breakeven && completed && gem) {
    return {
      className:
        "bg-green-600 text-green-100 border border-[color-mix(in_srgb,var(--green-600)_50%,var(--white-900)_50%)]",
      icon: <icons.GemUsedIcon size="sm" />,
    };
  }
  if (breakeven && completed) {
    return {
      className:
        "bg-green-600 text-green-100 border border-[color-mix(in_srgb,var(--green-600)_50%,var(--white-900)_50%)]",
      icon: <icons.CheckIcon size="sm" />,
    };
  }
  if (completed && gem) {
    return {
      className: "bg-black-900 text-yellow-100 border-white-900",
      icon: <icons.GemUsedIcon size="sm" />,
    };
  }
  if (gem) {
    return {
      className:
        "bg-red-800 text-red-100 border border-[color-mix(in_srgb,var(--red-800)_50%,var(--white-900)_50%)]",
      icon: <icons.GemIcon size="sm" />,
    };
  }
  if (completed) {
    return {
      className: "bg-black-900 text-primary-100 border-white-900",
      icon: <icons.CheckIcon size="sm" />,
    };
  }
  return {
    className:
      "bg-red-800 text-red-100 border border-[color-mix(in_srgb,var(--red-800)_50%,var(--white-900)_50%)]",
    icon: <icons.CloseIcon size="sm" />,
  };
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
        over: "border border-transparent",
      },
      size: {
        md: "h-5 md:h-6",
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
  const { className: stateClassName, icon: Icon } =
    variant === "over" ? getOverState(state || {}) : getStageState(state || {});

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
