import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { Banner, type BannerProps } from "@/components/elements/banner";

export interface BannersProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannersVariants> {
  banners: BannerProps[];
}

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
  banners,
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
        {banners.map((banner) => (
          <CarouselItem key={`${banner.preset}-${banner.name}`}>
            <Banner
              disabled={banner.disabled}
              hidden={banner.hidden}
              preset={banner.preset}
              name={banner.name}
              config={banner.config}
              position={banner.position}
              origin={banner.origin}
              onClick={banner.onClick}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
