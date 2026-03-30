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
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

type PlaybackState = "playing" | "paused" | "ended";

export interface MediaContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mediaContentVariants> {
  title: string;
  videos: string[];
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

const OverlayIcon = ({ state }: { state: PlaybackState }) => {
  if (state === "ended") return <RotateCcw className="h-8 w-8" />;
  if (state === "paused") return <Play className="h-8 w-8" />;
  return <Pause className="h-8 w-8" />;
};

export const MediaContent = ({
  title,
  videos,
  onClose,
  variant,
  className,
  ...props
}: MediaContentProps) => {
  const filterId = useId();
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("playing");
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const syncPlayback = useCallback((index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    setPlaybackState("playing");
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const index = api.selectedScrollSnap();
      setActiveIndex(index);
      syncPlayback(index);
    };

    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, syncPlayback]);

  useEffect(() => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    const onEnded = () => setPlaybackState("ended");
    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [activeIndex]);

  const handleOverlayClick = useCallback(() => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    if (playbackState === "ended") {
      video.currentTime = 0;
      video.play().catch(() => {});
      setPlaybackState("playing");
    } else if (playbackState === "paused") {
      video.play().catch(() => {});
      setPlaybackState("playing");
    } else {
      video.pause();
      setPlaybackState("paused");
    }
  }, [activeIndex, playbackState]);

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
          {videos.map((src, index) => (
            <CarouselItem key={src}>
              <div className="relative h-[200px] w-full">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={src}
                  playsInline
                  preload={index === activeIndex ? "auto" : "none"}
                  className="h-full w-full rounded-lg object-contain overflow-hidden"
                >
                  <track kind="captions" />
                </video>
                {index === activeIndex && (
                  <button
                    type="button"
                    className="group absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer"
                    onClick={handleOverlayClick}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg bg-black-800 transition-[opacity,backdrop-filter] duration-200",
                        playbackState === "playing"
                          ? "opacity-0 backdrop-blur-none group-hover:opacity-100 group-hover:backdrop-blur-sm"
                          : "opacity-100 backdrop-blur-sm",
                      )}
                    />
                    <div
                      className={cn(
                        "relative flex items-center justify-center h-12 w-12 rounded-full bg-black/60 text-white-100 transition-opacity duration-200",
                        playbackState === "playing"
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-100",
                      )}
                    >
                      <OverlayIcon state={playbackState} />
                    </div>
                  </button>
                )}
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
