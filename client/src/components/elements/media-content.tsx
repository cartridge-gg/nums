import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShadowEffect,
} from "@/components/icons";
import { Close } from "./close";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useId, useState } from "react";
import { Button } from "../ui/button";

export interface MediaContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mediaContentVariants> {
  title: string;
  items: React.ReactNode[];
  onClose?: () => void;
}

const mediaContentVariants = cva(
  "flex flex-col gap-4 px-2 py-4 rounded-2xl border-2",
  {
    variants: {
      variant: {
        default:
          "bg-black-100 border-secondary-100 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const MediaContent = ({
  title,
  items,
  onClose,
  variant,
  className,
  ...props
}: MediaContentProps) => {
  const filterId = useId();
  const [api, setApi] = useState<CarouselApi>();

  return (
    <div
      className={cn(mediaContentVariants({ variant, className }))}
      {...props}
    >
      <div className="flex justify-between items-center gap-3 px-2">
        <span
          className="font-primary text-[36px]/6 uppercase text-white-100 translate-y-0.5"
          style={{ textShadow: "2px 2px 0px #000000" }}
        >
          {title}
        </span>
        <Close size="md" onClick={onClose} />
      </div>

      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <div className="h-[200px] w-full rounded-lg overflow-hidden">
                {item}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <ShadowEffect filterId={filterId} />
      <div className="flex justify-between gap-3 px-2">
        <Button
          variant="ghost"
          className="flex flex-1 items-center justify-center h-8 p-2 rounded-lg bg-white-700 hover:bg-white-600 text-white-100 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_rgba(255,255,255,0.12)]"
          onClick={() => api?.scrollPrev()}
        >
          <ArrowLeftIcon size="md" style={{ filter: `url(#${filterId})` }} />
        </Button>
        <Button
          variant="ghost"
          className="flex flex-1 items-center justify-center h-8 p-2 rounded-lg bg-white-700 hover:bg-white-600 text-white-100 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_rgba(255,255,255,0.12)]"
          onClick={() => api?.scrollNext()}
        >
          <ArrowRightIcon size="md" style={{ filter: `url(#${filterId})` }} />
        </Button>
      </div>
    </div>
  );
};
