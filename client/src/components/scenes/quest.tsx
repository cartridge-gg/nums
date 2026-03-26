import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect } from "@/components/icons";
import { Quests, type QuestsProps } from "@/components/containers/quests";
import { Close } from "@/components/elements";
import { QuestCount } from "@/components/elements/quest-count";
import { QuestGift } from "@/components/elements/quest-gift";
import { QuestRefresh } from "@/components/elements/quest-refresh";
import { useId } from "react";

export interface QuestSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questSceneVariants> {
  questsProps: QuestsProps;
  onClose?: () => void;
}

const questSceneVariants = cva(
  "select-none flex items-center justify-center gap-6 md:gap-10 px-1 py-2 xs:px-5 xs:py-6 md:py-[120px] overflow-hidden w-full",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 backdrop-blur-[8px] border-[2px] border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const QuestScene = ({
  questsProps,
  onClose,
  variant,
  className,
  ...props
}: QuestSceneProps) => {
  const filterId = useId();
  const count = questsProps.quests.filter((q) => q.count >= q.total).length;
  const total = questsProps.quests.length;

  return (
    <div className={cn(questSceneVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />

      {/* Mobile */}
      <div className="flex flex-col md:hidden gap-6 w-full h-full">
        <div className="flex items-center justify-between w-full px-1">
          <Title />
          {onClose && (
            <div className="flex justify-end flex-shrink-0">
              <Close size="md" onClick={onClose} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mx-1">
          <QuestRefresh
            expiration={questsProps.expiration}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <QuestCount count={count} total={total} />
            {count < total && <QuestGift direction="left" />}
          </div>
        </div>
        <Quests {...questsProps} className="overflow-hidden" />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full">
        {onClose && (
          <Close
            size="lg"
            onClick={onClose}
            className="absolute z-10 top-8 right-8"
          />
        )}
        <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <Title />
            <div className="flex items-center gap-2">
              {count < total && <QuestGift direction="right" />}
              <QuestCount count={count} total={total} />
            </div>
          </div>
          <QuestRefresh expiration={questsProps.expiration} />
          <Quests {...questsProps} />
        </div>
      </div>
    </div>
  );
};

const Title = () => {
  return (
    <h2
      className="text-[36px]/6 md:text-[64px]/[44px] text-white-100 uppercase tracking-wider translate-y-0.5"
      style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      Daily Quests
    </h2>
  );
};
