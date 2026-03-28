import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  GovernanceCard,
  type GovernanceCardProps,
} from "@/components/elements/governance-card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShadowEffect,
} from "@/components/icons";
import { useEffect, useId, useState } from "react";

export interface GovernanceProposalsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof governanceProposalsVariants> {
  proposals: Array<GovernanceCardProps>;
}

const governanceProposalsVariants = cva(
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

export const GovernanceProposals = ({
  proposals,
  variant,
  className,
  ...props
}: GovernanceProposalsProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const filterId = useId();

  useEffect(() => {
    if (!api) return;

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  return (
    <div
      className={cn(governanceProposalsVariants({ variant, className }))}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="min-h-8 flex items-center">
            <h2
              className="text-[28px]/[19px] md:text-[36px]/[24px] tracking-wider text-white-100 translate-y-0.5"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              Proposals
            </h2>
          </div>
          <div className="h-8 flex justify-center items-center px-3 bg-white-800 rounded-full">
            <span
              className="text-[22px]/[15px] md:text-[28px]/[19px] tracking-wide translate-y-0.5"
              style={{
                textShadow: "1px 1px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              {proposals.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShadowEffect filterId={filterId} />
          <Button
            variant="muted"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev || proposals.length <= 1}
            className="h-8 w-8 rounded-full bg-primary-700 hover:bg-primary-600"
          >
            <ArrowLeftIcon size="md" style={{ filter: `url(#${filterId})` }} />
          </Button>
          <Button
            variant="muted"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext || proposals.length <= 1}
            className="h-8 w-8 rounded-full bg-primary-700 hover:bg-primary-600"
          >
            <ArrowRightIcon size="md" style={{ filter: `url(#${filterId})` }} />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <Carousel opts={{ loop: false }} setApi={setApi} className="w-full">
        <CarouselContent className="w-full">
          {proposals.length === 0 ? (
            <CarouselItem>
              <div className="select-none flex flex-col items-center justify-center p-6 gap-4 rounded-xl bg-white-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_0px_rgba(255,255,255,0.04)]">
                <p className="text-primary-100 text-[22px]/[20px] tracking-wider translate-y-0.5 text-center">
                  No active proposals
                </p>
              </div>
            </CarouselItem>
          ) : (
            proposals.map((proposal, index) => (
              <CarouselItem key={index}>
                <GovernanceCard {...proposal} />
              </CarouselItem>
            ))
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
