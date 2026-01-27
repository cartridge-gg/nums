import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "../ui/button";
import {
  GlitchbombCover,
  HistogramCover,
  TutorialCover,
} from "@/components/covers";
import { GlitchbombIcon } from "../icons";

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {}

const bannerVariants = cva(
  "select-none relative rounded-xl flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 overflow-hidden",
  {
    variants: {
      variant: {
        social:
          "bg-gradient-to-t from-transparent to-purple-300 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        tutorial:
          "bg-gradient-to-t from-transparent to-purple-300 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        glitchbomb:
          "bg-gradient-to-t from-[rgba(4,6,3,1)] to-[rgba(12,24,6,1)]",
      },
      size: {
        md: "h-[75px] md:h-24 w-full",
      },
    },
    defaultVariants: {
      variant: "social",
      size: "md",
    },
  },
);

export const Banner = ({ variant, size, className, ...props }: BannerProps) => {
  return (
    <div
      className={cn(bannerVariants({ variant, size, className }))}
      {...props}
    >
      {variant === "social" ? (
        <>
          <div className="absolute top-0 left-0 w-full h-full">
            <HistogramCover
              fit="cover"
              className="w-full h-full text-mauve-100"
            />
          </div>
          <div className="relative flex flex-col gap-2 uppercase">
            <span
              className="text-lg/3 md:text-[22px]/[15px] text-mauve-100 tracking-wider translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              Spread the word...
            </span>
            <strong
              className="text-[28px]/[19px] md:text-[36px]/6 text-white-100 tracking-wider translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              Play for free!
            </strong>
          </div>
          <Button
            disabled
            variant="muted"
            className="relative bg-mauve-100 hover:bg-mauve-200 px-3 py-1"
          >
            <p
              className="text-[28px]/[19px] tracking-wider hidden md:block translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Share to claim!
            </p>
            <p
              className="text-[28px]/[19px] tracking-wider block md:hidden translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Share!
            </p>
          </Button>
        </>
      ) : variant === "tutorial" ? (
        <>
          <div className="absolute top-0 left-0 w-full h-full">
            <TutorialCover
              fit="cover"
              className="w-full h-full text-mauve-100"
            />
          </div>
          <strong
            className="text-[28px]/[19px] md:text-[36px]/6 text-white-100 tracking-wider translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            How to play!
          </strong>
          <div className="align-middle relative flex flex-col md:flex-row gap-2 md:gap-6 whitespace-nowrap">
            <div className="relative bg-black-800 px-2 md:px-3 py-1 md:py-2 flex gap-4 rounded-lg shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]">
              <p
                className="text-[18px]/[12px] md:text-[28px]/[19px] tracking-wide translate-y-1 md:translate-y-[2.5px] uppercase"
                style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
              >
                Step 1
              </p>
              <p className="text-xs md:text-base/5 font-circular">Get Number</p>
            </div>
            <div className="align-middle relative bg-black-800 px-2 md:px-3 py-1 md:py-2 flex gap-4 rounded-lg shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]">
              <p
                className="text-[18px]/[12px] md:text-[28px]/[19px] tracking-wide translate-y-1 md:translate-y-[2.5px] uppercase"
                style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
              >
                Step 2
              </p>
              <p className="text-xs md:text-base/5 font-circular">
                Place Number
              </p>
            </div>
          </div>
        </>
      ) : variant === "glitchbomb" ? (
        <>
          <div className="absolute top-0 left-0 w-full h-full">
            <GlitchbombCover
              fit="cover"
              className="w-full h-full text-glitchbomb-100"
            />
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <GlitchbombIcon className="relative w-9 h-9 md:w-12 md:h-12 text-glitchbomb-100" />
            <div className="flex flex-col gap-1 md:gap-2 uppercase">
              <span
                className="text-lg/3 md:text-[22px]/[15px] text-glitchbomb tracking-wider translate-y-0.5"
                style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
              >
                Play
              </span>
              <strong
                className="text-[28px]/[19px] md:text-[36px]/6 text-white-100 tracking-wider translate-y-0.5 font-thin"
                style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
              >
                Glitchbomb
              </strong>
            </div>
          </div>
          <Button
            disabled
            className="relative bg-glitchbomb-100 hover:bg-glitchbomb-200 px-3 py-1 text-gray-100"
          >
            <p
              className="text-[28px]/[19px] tracking-wider translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Play
            </p>
          </Button>
        </>
      ) : null}
    </div>
  );
};
