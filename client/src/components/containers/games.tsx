import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Game } from "@/components/elements/game";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { useEffect, useId, useState } from "react";

export interface GamesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gamesVariants> {
  games: Array<{
    gameId: number;
    score?: number;
    breakEven?: string | number;
    payout?: string | number;
  }>;
  gameId?: number;
  setGameId: (id: number) => void;
}

const gamesVariants = cva(
  "select-none relative w-full flex flex-col gap-4 md:gap-6",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Games = ({
  games,
  gameId,
  setGameId,
  variant,
  className,
  ...props
}: GamesProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const filterId = useId();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());

      // Update gameId when carousel selection changes
      const selectedIndex = api.selectedScrollSnap();
      if (selectedIndex === games.length) {
        // New card selected
        setGameId(0);
      } else if (selectedIndex >= 0 && selectedIndex < games.length) {
        // Game card selected
        const selectedGame = games[selectedIndex];
        if (selectedGame) {
          setGameId(selectedGame.gameId);
        }
      }
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, games, setGameId]);

  // Find the index of the active gameId, or the last index (new card) if gameId is 0 or undefined
  useEffect(() => {
    if (!api) return;

    if (gameId === 0 || gameId === undefined) {
      // Scroll to the last item (new card)
      api.scrollTo(games.length);
    } else {
      // Find the index of the gameId
      const index = games.findIndex((g) => g.gameId === gameId);
      if (index !== -1) {
        api.scrollTo(index);
      }
    }
  }, [api, gameId, games]);

  const handleCardClick = (clickedGameId: number | undefined) => {
    if (clickedGameId === undefined) {
      // New card clicked
      setGameId(0);
    } else {
      setGameId(clickedGameId);
    }
  };

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  return (
    <div
      className={cn(gamesVariants({ variant, className }), "w-full")}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="min-h-8 flex items-center">
            <h2
              className="text-[28px]/[19px] md:text-[36px]/[24px] tracking-wider text-white-100 translate-y-0.5"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              My Games
            </h2>
          </div>
          <div className="h-8 flex justify-center items-center px-3 bg-black-800 rounded-full">
            <span
              className="text-[22px]/[15px] md:text-[28px]/[19px] tracking-wide translate-y-0.5"
              style={{
                textShadow: "1px 1px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              {games.length ? games.length : "None"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <filter
                id={filterId}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="2"
                  dy="2"
                  stdDeviation="0"
                  floodColor="rgba(0, 0, 0, 0.25)"
                />
              </filter>
            </defs>
          </svg>
          <Button
            variant="muted"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="h-8 w-8 rounded-full bg-mauve-700 hover:bg-mauve-600"
          >
            <ArrowLeftIcon size="md" style={{ filter: `url(#${filterId})` }} />
          </Button>
          <Button
            variant="muted"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-8 w-8 rounded-full bg-mauve-700 hover:bg-mauve-600"
          >
            <ArrowRightIcon size="md" style={{ filter: `url(#${filterId})` }} />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <Carousel opts={{ loop: false }} setApi={setApi} className="w-full">
        <CarouselContent className="w-full">
          {games.map((game) => (
            <CarouselItem key={game.gameId}>
              <Game
                gameId={game.gameId}
                score={game.score}
                breakEven={game.breakEven}
                payout={game.payout}
                variant={gameId === game.gameId ? "default" : "default"}
                onClick={() => handleCardClick(game.gameId)}
              />
            </CarouselItem>
          ))}
          {/* New card */}
          <CarouselItem>
            <Game
              variant="new"
              breakEven="14"
              payout="$100"
              onClick={() => handleCardClick(undefined)}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};
