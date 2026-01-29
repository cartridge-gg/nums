import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/icons/transparents";
import { Quests, type QuestsProps } from "@/components/containers/quests";
import { Claim } from "../elements";

export interface QuestSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questSceneVariants> {
  questsProps: QuestsProps;
  onClaimAll?: () => void;
  onClose?: () => void;
}

const questSceneVariants = cva(
  "select-none flex items-center justify-center gap-6 md:gap-10 p-2 xs:p-6 rounded-xl overflow-hidden w-full",
  {
    variants: {
      variant: {
        default:
          "bg-black-300 backdrop-blur-[8px] border-[2px] border-black-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const QuestScene = ({
  questsProps,
  onClaimAll,
  onClose,
  variant,
  className,
  ...props
}: QuestSceneProps) => {
  return (
    <div className={cn(questSceneVariants({ variant, className }))} {...props}>
      {/* Mobile */}
      <div
        className="flex flex-col md:hidden gap-6 w-full h-full overflow-y-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Mobile header with close button */}
        <div className="flex flex-col w-full items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <Title />
            {onClose && (
              <div className="flex justify-end flex-shrink-0">
                <Button
                  variant="ghost"
                  className="bg-white-800 h-10 w-10 p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded"
                  onClick={onClose}
                >
                  <CloseIcon size="md" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between w-full">
            {onClaimAll ? (
              <Button
                variant="secondary"
                className="bg-purple-100 hover:bg-purple-200 px-5 w-full"
                onClick={onClaimAll}
              >
                <p
                  className="text-white-100 text-[28px] tracking-wide translate-y-0.5"
                  style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
                >
                  Claim All
                </p>
              </Button>
            ) : (
              <Claim
                claimed={false}
                isCompleted={false}
                expiration={questsProps.expiration}
                variant="secondary"
                className="w-full"
              />
            )}
          </div>
        </div>
        <Quests {...questsProps} />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:flex-col md:items-stretch overflow-hidden h-full w-full max-h-[573px]">
        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            className="absolute z-10 top-8 right-8 bg-white-800 h-12 w-[56px] p-0 text-white-100 hover:text-white-400 hover:bg-white-900 rounded-lg"
            onClick={onClose}
          >
            <CloseIcon size="lg" />
          </Button>
        )}
        <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <Title />
            <Claim
              claimed={false}
              isCompleted={false}
              expiration={questsProps.expiration}
              variant="secondary"
            />
            <Button
              variant="secondary"
              className={cn(
                "bg-purple-100 hover:bg-purple-200 px-5",
                !onClaimAll && "invisible",
              )}
              onClick={onClaimAll}
            >
              <p
                className="text-white-100 text-[28px] tracking-wide translate-y-0.5"
                style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
              >
                Claim All
              </p>
            </Button>
          </div>
          <Quests {...questsProps} className="max-w-[720px] self-center" />
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
      Quests
    </h2>
  );
};
