import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AchievementCard,
  type AchievementCardProps,
  AchievementItem,
} from "@/components/elements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

export interface AchievementsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementsVariants> {
  achievements: (AchievementCardProps & { id: string })[];
  newAchievementIds?: Set<string>;
}

const achievementsVariants = cva(
  "flex flex-col gap-6 h-full w-full overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Achievements = ({
  achievements,
  newAchievementIds,
  variant,
  className,
  ...props
}: AchievementsProps) => {
  const earned = achievements.filter((a) => a.count >= a.total);
  const remaining = achievements
    .filter((a) => a.count < a.total)
    .sort(
      (a, b) =>
        (b.total > 0 ? b.count / b.total : 0) -
        (a.total > 0 ? a.count / a.total : 0),
    );

  const defaultSelected =
    remaining.length > 0
      ? achievements.indexOf(
          remaining.reduce((best, item) =>
            item.total > 0 && item.count / item.total > best.count / best.total
              ? item
              : best,
          ),
        )
      : 0;

  const [selected, setSelected] = useState(defaultSelected);
  const featured = achievements[selected];

  return (
    <div
      className={cn(achievementsVariants({ variant, className }))}
      {...props}
    >
      {featured && (
        <div className="flex w-full px-1 md:hidden">
          <AchievementCard
            key={selected}
            {...featured}
            variant={featured.count >= featured.total ? "complete" : "default"}
            className="w-full"
          />
        </div>
      )}

      <div
        className="flex flex-col gap-6 flex-1 h-full overflow-y-auto px-1 pb-2 md:pb-0"
        style={{ scrollbarWidth: "none" }}
      >
        <TooltipProvider delayDuration={0}>
          {earned.length > 0 && (
            <AchievementSection title="Earned">
              {earned.map((item) => {
                const index = achievements.indexOf(item);
                return (
                  <AchievementItemWithTooltip
                    key={item.id}
                    item={item}
                    index={index}
                    itemVariant="complete"
                    selected={selected === index}
                    hidden={false}
                    isNew={newAchievementIds?.has(item.id)}
                    onSelect={() => setSelected(index)}
                  />
                );
              })}
              {earned.length % 2 !== 0 && <AchievementItem />}
            </AchievementSection>
          )}

          {remaining.length > 0 && (
            <AchievementSection title="Remaining">
              {remaining.map((item) => {
                const index = achievements.indexOf(item);
                return (
                  <AchievementItemWithTooltip
                    key={item.id}
                    item={item}
                    index={index}
                    itemVariant="default"
                    selected={selected === index}
                    hidden={item.hidden || false}
                    isNew={newAchievementIds?.has(item.id)}
                    onSelect={() => setSelected(index)}
                  />
                );
              })}
              {remaining.length % 2 !== 0 && <AchievementItem />}
            </AchievementSection>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
};

const AchievementItemWithTooltip = ({
  item,
  index,
  itemVariant,
  selected,
  hidden,
  isNew,
  onSelect,
}: {
  item: AchievementCardProps;
  index: number;
  itemVariant: "default" | "complete";
  selected: boolean;
  hidden: boolean;
  isNew?: boolean;
  onSelect: () => void;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div>
        <AchievementItem
          icon={item.icon}
          name={item.title}
          count={item.count}
          total={item.total}
          variant={itemVariant}
          selected={selected}
          hidden={hidden}
          isNew={isNew}
          onClick={() => {
            if (window.matchMedia("(min-width: 768px)").matches || hidden)
              return;
            onSelect();
          }}
          className="md:!outline-0"
        />
      </div>
    </TooltipTrigger>
    <TooltipContent
      side="top"
      sideOffset={8}
      className="hidden md:block bg-transparent border-none shadow-none p-0 rounded-none w-[400px] !animate-none"
    >
      <AchievementCard
        key={index}
        {...item}
        variant="float"
        className={cn("w-full", hidden && "hidden")}
      />
    </TooltipContent>
  </Tooltip>
);

const AchievementSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center p-1">
      <p className="font-primary text-[22px]/[15px] tracking-[0.03em] text-white-400 translate-y-0.5">
        {title}
      </p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{children}</div>
  </div>
);
