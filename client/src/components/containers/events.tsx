import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Event, type EventProps } from "@/components/elements/event";
import { useRef, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const eventsVariants = cva("relative overflow-hidden bg-black-300 py-1.5", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface EventsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof eventsVariants> {
  events: EventProps[];
}

export const Events = ({
  events,
  variant,
  className,
  ...props
}: EventsProps) => {
  const plugin = useRef(
    Autoplay({
      delay: 0,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const [api, setApi] = useState<CarouselApi>();
  // Detect changes in events and reset to index 0
  useEffect(() => {
    if (!api) return;
    api.scrollTo(0, false);
  }, [api, events]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className={cn(eventsVariants({ variant, className }))} {...props}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          duration: 30000,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-0 items-center gap-4">
          {events.map((event, index) => (
            <CarouselItem
              key={event.key}
              className={cn(
                "basis-auto px-2",
                "before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white-100 before:absolute before:left-[-10px] before:top-1/2 before:-translate-y-1/2 relative",
                index === events.length - 1 && "mr-4",
              )}
            >
              <Event {...event} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
