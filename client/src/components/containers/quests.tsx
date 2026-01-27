import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Quest, type QuestProps } from "@/components/elements/quest";

export interface QuestsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questsVariants> {
  quests: QuestProps[];
  expiration: number;
}

const questsVariants = cva(
  "h-full w-full flex flex-col gap-4 overflow-y-auto pb-px pr-px grow",
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
  variant,
  className,
  style,
  ...props
}: QuestsProps) => {
  return (
    <div
      className={cn(questsVariants({ variant, className }))}
      style={{ scrollbarWidth: "none", ...style }}
      {...props}
    >
      {quests.length === 0 ? (
        <div className="bg-black-900 border border-white-800 rounded-lg py-12 flex items-center justify-center h-full">
          <p
            className="text-white-300 text-lg/6 tracking-wider translate-y-0.5 w-1/2 text-center"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            No quests available yet
          </p>
        </div>
      ) : (
        quests
          .sort((a, b) => b.count / b.total - a.count / a.total)
          .sort((a, b) => (a.claimed ? 1 : b.claimed ? -1 : 0))
          .map((quest, index) => <Quest key={index} {...quest} />)
      )}
    </div>
  );
};
