import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, CrossIcon, LockerIcon } from "@/components/icons";
import { External } from "./external";

export interface GovernanceCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof governanceCardVariants> {
  index: number;
  content: string;
  to: string;
  locked?: boolean;
  accepted?: boolean;
  rejected?: boolean;
}

const governanceCardVariants = cva(
  "select-none flex flex-col p-6 gap-4 rounded-xl bg-white-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_0px_rgba(255,255,255,0.04)]",
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

export const GovernanceCard = ({
  index,
  content,
  to,
  locked,
  accepted,
  rejected,
  variant,
  className,
  ...props
}: GovernanceCardProps) => {
  return (
    <div
      className={cn(governanceCardVariants({ variant, className }))}
      {...props}
    >
      <div className="flex justify-between items-center gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="flex justify-center items-center px-1.5 py-1 bg-white-900 rounded">
            <span className="font-sans text-sm/[18px] text-primary-100">
              Prop {index}
            </span>
          </div>
          {locked && (
            <div className="flex items-center px-1 gap-0.5 h-6 bg-white-900 rounded">
              <LockerIcon size="xs" className="text-primary-100" />
              <span className="font-sans text-sm/[18px] text-primary-100 px-0.5">
                Locked
              </span>
            </div>
          )}
          {accepted && (
            <div className="flex items-center px-1 gap-0.5 h-6 bg-white-900 rounded">
              <CheckIcon size="xs" className="text-green-100" />
              <span className="font-sans text-sm/[18px] text-green-100 px-0.5">
                Accepted
              </span>
            </div>
          )}
          {rejected && (
            <div className="flex items-center px-1 gap-0.5 h-6 bg-white-900 rounded">
              <CrossIcon size="xs" className="text-red-100" />
              <span className="font-sans text-sm/[18px] text-red-100 px-0.5">
                Rejected
              </span>
            </div>
          )}
        </div>
        <External to={to} label="Full Proposal" className="h-6" />
      </div>
      <p className="font-sans text-base/5 text-white-100">{content}</p>
    </div>
  );
};
