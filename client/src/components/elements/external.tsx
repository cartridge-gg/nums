import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLinkIcon } from "@/components/icons";
import { Link } from "@/lib/router";

export interface ExternalProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof externalVariants> {
  to: string;
  label?: string;
}

const externalVariants = cva(
  "flex px-2 items-center gap-0.5 h-8 rounded transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "bg-white-900 hover:bg-white-800 text-white-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const External = ({
  to,
  label = "Read More",
  variant,
  className,
  ...props
}: ExternalProps) => {
  return (
    <Link
      to={to}
      target="_blank"
      className={cn(externalVariants({ variant, className }))}
      {...props}
    >
      <p className="font-sans text-sm/5 px-0.5">{label}</p>
      <ExternalLinkIcon size="xs" />
    </Link>
  );
};
