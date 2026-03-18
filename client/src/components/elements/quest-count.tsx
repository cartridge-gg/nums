import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { QuestIcon } from "@/components/icons";

export interface QuestCountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questCountVariants> {
  count: number;
  total: number;
}

const questCountVariants = cva(
  "flex items-center px-3 py-2.5 gap-2 bg-white-900 rounded-lg",
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

export const QuestCount = ({
  count,
  total,
  variant,
  className,
  ...props
}: QuestCountProps) => {
  return (
    <div className={cn(questCountVariants({ variant, className }))} {...props}>
      <QuestIcon size="sm" className="text-green-100" />
      <div className="flex items-center gap-1 font-sans text-base/5">
        <span className="text-green-100">{count}</span>
        <span className="text-white-400">/</span>
        <span className="text-white-100">{total}</span>
      </div>
    </div>
  );
};
