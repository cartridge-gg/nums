import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AssetIcon, QuestUsedIcon, TrophyUsedIcon } from "../icons";

const toastThumbnailVariants = cva("flex justify-center items-center rounded", {
  variants: {
    variant: {
      default: "bg-white-900",
    },
    size: {
      md: "min-h-10 min-w-10 max-h-10 max-w-10",
    },
    type: {
      achievement: "",
      quest: "",
      purchase: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    type: "quest",
  },
});

export interface ToastThumbnailProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof toastThumbnailVariants> {
  src?: string;
  alt?: string;
}

export const ToastThumbnail = ({
  src,
  alt = "Toast thumbnail",
  variant,
  size,
  type,
  className,
  ...props
}: ToastThumbnailProps) => {
  return (
    <div
      className={cn(toastThumbnailVariants({ variant, size, type, className }))}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : type === "achievement" ? (
        <TrophyUsedIcon size="lg" className="text-yellow-100" />
      ) : type === "quest" ? (
        <QuestUsedIcon size="lg" className="text-green-100" />
      ) : type === "purchase" ? (
        <AssetIcon size="lg" className="border-2 border-[#4017B5] rounded" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-mauve-600 to-purple-600" />
      )}
    </div>
  );
};
