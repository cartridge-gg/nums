import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { Banner } from "@/components/elements/banner";

export interface BannersProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannersVariants> {}

const bannersVariants = cva("select-none relative w-full", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      md: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Banners = ({
  variant,
  size,
  className,
  ...props
}: BannersProps) => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[plugin.current]}
      className={cn(bannersVariants({ variant, size, className }), "w-full")}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      {...props}
    >
      <CarouselContent className="w-full">
        <CarouselItem>
          <Banner variant="social" />
        </CarouselItem>
        <CarouselItem>
          <Banner variant="tutorial" />
        </CarouselItem>
        <CarouselItem>
          <Banner variant="glitchbomb" />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};
