import { useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShadowEffect } from "@/components/icons";
import { Place, type PlaceProps, Close } from "@/components/elements";

export interface PlacesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof placesVariants> {
  place: PlaceProps;
  onClose?: () => void;
}

const placesVariants = cva(
  "h-auto w-full select-none flex flex-col gap-6 p-6 md:gap-12 md:p-12 relative",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Places = ({
  place,
  onClose,
  variant,
  className,
  ...props
}: PlacesProps) => {
  const filterId = useId();

  return (
    <div className={cn(placesVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />

      {/* Close button */}
      <Close
        size="lg"
        onClick={onClose}
        className="absolute z-10 top-6 right-6 hidden md:flex"
      />

      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className="font-primary text-[36px]/[24px] md:text-[48px]/[33px] tracking-wider uppercase translate-y-1"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Special Tile
        </h2>
        <Close size="md" className="md:hidden" onClick={onClose} />
      </div>

      {/* Place */}
      <Place {...place} className={cn("w-full", place.className)} />
    </div>
  );
};
