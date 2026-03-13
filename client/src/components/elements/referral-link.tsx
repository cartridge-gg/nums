import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CopyIcon } from "@/components/icons";

export interface ReferralLinkProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralLinkVariants> {
  link: string;
}

const referralLinkVariants = cva(
  "select-none relative cursor-pointer flex group",
  {
    variants: {
      variant: {
        default: "h-11 max-w-[204px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ReferralLink = ({
  link,
  variant,
  className,
  ...props
}: ReferralLinkProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [link]);

  return (
    <div
      className={cn(referralLinkVariants({ variant, className }))}
      onClick={handleCopy}
      {...props}
    >
      <div className="h-full flex p-3 bg-white-800 rounded-l-lg overflow-hidden">
        <span className="text-base font-sans text-white-100 truncate whitespace-nowrap">
          {link}
        </span>
      </div>
      <div className="relative h-full min-w-11 bg-white-700 group-hover:bg-white-600 rounded-r-lg flex justify-center items-center transition-colors duration-150">
        <CopyIcon size="sm" className="text-white-100" />
        {copied && (
          <div className="absolute -top-4 left-0 -translate-x-1/2 px-2 py-1 rounded bg-black-100 text-white-200 text-xs font-sans whitespace-nowrap">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
};
