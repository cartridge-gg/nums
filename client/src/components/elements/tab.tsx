import { useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { TabsTrigger } from "@/components/ui/tabs";

export interface TabProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TabsTrigger>, "children">,
    VariantProps<typeof tabVariants> {
  label: string;
  icon?: React.ComponentType<any>;
  iconProps?: Record<string, any>;
}

const tabVariants = cva("", {
  variants: {
    variant: {
      default: "", // Uses base TabsTrigger styles (for QuestTab/LeaderboardTab)
      mauve:
        "group h-10 gap-0.5 py-2 px-3 rounded-lg bg-mauve-700 hover:bg-mauve-600 data-[state=active]:bg-mauve-500 data-[state=active]:hover:bg-mauve-500 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)] transition-all duration-150", // For FreeTab/BlitzTab
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Tab = ({
  label,
  icon: Icon,
  iconProps,
  variant,
  className,
  ...props
}: TabProps) => {
  const filterId = useId();

  return (
    <TabsTrigger className={cn(tabVariants({ variant, className }))} {...props}>
      {Icon && (
        <>
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <filter
                id={filterId}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="2"
                  dy="2"
                  stdDeviation="0"
                  floodColor="rgba(0, 0, 0, 0.25)"
                />
              </filter>
            </defs>
          </svg>
          <Icon
            size="md"
            className="text-white-400 group-hover:text-white-200 group-data-[state=active]:text-white-100 transition-colors duration-150"
            style={{ filter: `url(#${filterId})` }}
            {...iconProps}
          />
        </>
      )}
      {variant === "mauve" ? (
        <span
          className="w-full text-center font-primary text-[28px] leading-none tracking-wide text-white-400 group-hover:text-white-200 group-data-[state=active]:text-white-100 transition-colors duration-150 translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          {label}
        </span>
      ) : (
        <span
          className="hidden md:inline font-primary text-[28px]/[19px] tracking-wider text-white-400 group-hover:text-white-200 group-data-[state=active]:text-white-100 px-1 translate-y-0.5 transition-colors duration-150"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          {label}
        </span>
      )}
    </TabsTrigger>
  );
};
