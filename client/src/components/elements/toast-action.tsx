import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EyeIcon } from "../icons";

const toastActionVariants = cva("bg-white-900 hover:bg-white-800 px-3", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ToastActionProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof toastActionVariants> {
  to: string;
}

export const ToastAction = ({
  to,
  variant,
  className,
  ...props
}: ToastActionProps) => {
  return (
    <Button
      variant="muted"
      className={cn(toastActionVariants({ variant, className }))}
      {...props}
    >
      <Link to={to}>
        <EyeIcon size="md" className="text-white-100" />
      </Link>
    </Button>
  );
};
