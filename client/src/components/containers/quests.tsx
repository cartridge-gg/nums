import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { QuestRefresh } from "@/components/elements/quest-refresh";
import {
  QuestCard,
  type QuestCardProps,
} from "@/components/elements/quest-card";

export interface QuestsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questsVariants> {
  quests: (QuestCardProps & { id: string })[];
  expiration: number;
  newQuestIds?: Set<string>;
}

const questsVariants = cva(
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

export const Quests = ({
  quests,
  expiration,
  newQuestIds,
  variant,
  className,
  ...props
}: QuestsProps) => {
  const completed = quests.filter((q) => q.count >= q.total);
  const remaining = quests.filter((q) => q.count < q.total);

  return (
    <div className={cn(questsVariants({ variant, className }))} {...props}>
      {/* <div className="flex items-center gap-2 px-1 md:hidden">
        <QuestCount count={completed.length} total={quests.length} />
        {completed.length < quests.length && <QuestGift direction="left" />}
      </div> */}

      <QuestRefresh expiration={expiration} className="mx-1" />

      <div
        className="flex flex-col gap-4 flex-1 h-full overflow-y-auto px-1 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {quests.length === 0 ? (
          <div className="bg-black-900 border border-white-800 rounded-lg py-12 flex items-center justify-center h-full">
            <p
              className="text-white-300 text-lg/6 tracking-wider translate-y-0.5 w-1/2 text-center"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              No quests available yet
            </p>
          </div>
        ) : (
          <>
            {remaining.length > 0 && (
              <QuestSection title="Remaining">
                {remaining.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    {...quest}
                    variant="default"
                    isNew={newQuestIds?.has(quest.id)}
                  />
                ))}
              </QuestSection>
            )}

            {completed.length > 0 && (
              <QuestSection title="Completed">
                {completed.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    {...quest}
                    variant="complete"
                    isNew={newQuestIds?.has(quest.id)}
                  />
                ))}
              </QuestSection>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const QuestSection = ({
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
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);
