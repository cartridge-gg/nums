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
import { useBanners, type GameBanner } from "@/hooks/banner";

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

const BANNERS: GameBanner[] = [
  { preset: "nums", name: "social" },
  { preset: "nums", name: "tutorial" },
  { preset: "loot-survivor", name: "loot-survivor", position: 64 },
  { preset: "dope-wars", name: "dope-wars", position: 16 },
  {
    preset: "eternum",
    name: "eternum",
    position: 16,
    origin: "https://blitz.realms.world/",
  },
  { preset: "glitch-bomb", name: "glitch-bomb", position: 0 },
  { preset: "savage-summit", name: "savage-summit", position: 0 },
];

export const Banners = ({
  variant,
  size,
  className,
  ...props
}: BannersProps) => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const { banners } = useBanners(BANNERS);

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
