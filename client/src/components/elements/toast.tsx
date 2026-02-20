import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ToastTitle, type ToastTitleProps } from "./toast-title";
import {
  ToastDescription,
  getColor,
  type ToastDescriptionProps,
} from "./toast-description";
import { ToastAction, type ToastActionProps } from "./toast-action";
import { ToastThumbnail, type ToastThumbnailProps } from "./toast-thumbnail";
import { useMemo } from "react";

const toastVariants = cva("flex flex-col rounded-lg overflow-hidden", {
  variants: {
    variant: {
      default: "w-full",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  titleProps: ToastTitleProps;
  descriptionProps: ToastDescriptionProps;
  thumbnailProps?: ToastThumbnailProps;
  actionProps?: ToastActionProps;
}

export const Toast = ({
  titleProps,
  descriptionProps,
  thumbnailProps,
  actionProps,
  variant,
  className,
  ...props
}: ToastProps) => {
  const titleColor = useMemo(() => {
    if (thumbnailProps?.type === "achievement") return "text-yellow-100";
    if (thumbnailProps?.type === "quest") return "text-green-100";
    if (thumbnailProps?.type === "purchase") return "text-mauve-100";
    if (!!descriptionProps?.earning) return "text-green-100";
    if (!!descriptionProps?.multiplier)
      return getColor(descriptionProps.multiplier);
    return undefined;
  }, [
    thumbnailProps?.type,
    descriptionProps?.earning,
    descriptionProps?.multiplier,
  ]);

  return (
    <div className={cn(toastVariants({ variant, className }))} {...props}>
      <div className="bg-[#180840] flex justify-between items-center p-3 gap-2">
        <div className="flex items-center justify-start gap-3">
          {thumbnailProps && <ToastThumbnail {...thumbnailProps} />}
          <div
            className={cn(
              "flex flex-col items-stretch justify-between gap-1 translate-y-0.5",
              !thumbnailProps && "pl-1",
            )}
          >
            {titleProps && (
              <ToastTitle {...titleProps} className={titleColor} />
            )}
            {descriptionProps && <ToastDescription {...descriptionProps} />}
          </div>
        </div>
        {actionProps && <ToastAction {...actionProps} />}
      </div>
      <div className="bg-[#201248] h-1 relative">
        <div className="absolute bottom-0 left-0 h-1 w-full bg-mauve-100 origin-left animate-toast-progress z-10" />
      </div>
    </div>
  );
};
