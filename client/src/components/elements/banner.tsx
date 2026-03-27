import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "../ui/button";
import type { ControllerConfig } from "@cartridge/presets";
import { Link } from "@/lib/router";
import { MainCover } from "../covers";

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  preset: string;
  name: string;
  disabled?: boolean;
  hidden?: boolean;
  config?: ControllerConfig;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

const bannerVariants = cva(
  "select-none relative rounded-xl flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 overflow-hidden bg-gradient-to-t from-[rgba(4,4,6,1)] to-[rgba(12,12,20,1)] shadow-[1px_1px_0px_0px_rgba(255,255,255,0.08)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      size: {
        md: "h-16 md:h-24 w-full shadow-[1px_1px_0px_0px_rgba(255,255,255,0.08)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function resolveImageUrl(value: unknown, size: number): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  if ("webp" in obj) {
    const svg = obj.svg as Record<number, string> | undefined;
    const png = obj.png as Record<number, string> | undefined;
    const jpg = obj.jpg as Record<number, string> | undefined;
    const webp = obj.webp as Record<number, string> | undefined;
    return svg?.[size] ?? png?.[size] ?? jpg?.[size] ?? webp?.[size];
  }
  if ("dark" in obj && typeof obj.dark === "object" && obj.dark !== null) {
    return resolveImageUrl(obj.dark, size);
  }
  return undefined;
}

export const Banner = (props: BannerProps) => {
  switch (props.name) {
    case "social":
      return <Social {...props} />;
    case "tutorial":
      return <Tutorial {...props} />;
    default:
      return <Game {...props} />;
  }
};

const Social = ({
  disabled,
  position,
  size,
  className,
  onClick,
  ...props
}: BannerProps) => {
  return (
    <div
      className={cn(
        bannerVariants({ size, className }),
        "bg-gradient-to-t from-transparent to-secondary-300 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <MainCover fit="cover" className="text-secondary-100" />
      </div>
      <div className="relative flex flex-col gap-2 uppercase">
        <span
          className="text-lg/3 md:text-[22px]/[15px] text-primary-100 tracking-wider translate-y-0.5"
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
        disabled={disabled}
        variant="muted"
        className="relative bg-primary-100 hover:bg-primary-200 px-3 py-1"
        onClick={onClick}
      >
        <p
          className="text-[28px]/[19px] tracking-wider hidden md:block translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          {onClick ? "Share to claim!" : "Claimed!"}
        </p>
        <p
          className="text-[28px]/[19px] tracking-wider block md:hidden translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Share!
        </p>
      </Button>
    </div>
  );
};

const Tutorial = ({ position, size, className, ...props }: BannerProps) => {
  return (
    <div
      className={cn(
        bannerVariants({ size, className }),
        "bg-gradient-to-t from-transparent to-secondary-300 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <MainCover fit="cover" className="text-secondary-100" />
      </div>
      <strong
        className="text-[28px]/[19px] md:text-[36px]/6 text-white-100 tracking-wider translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        How to play!
      </strong>
      <div className="align-middle relative flex flex-col md:flex-row gap-1.5 md:gap-6 whitespace-nowrap">
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
          <p className="text-xs md:text-base/5 font-circular">Place Number</p>
        </div>
      </div>
    </div>
  );
};

const Game = ({
  config,
  position,
  origin: originOverride,
  onClick,
  size,
  className,
  ...props
}: BannerProps) => {
  if (!config) return null;

  const configOrigins = (
    Array.isArray(config.origin) ? config.origin : [config.origin]
  ).filter((o: string) => o !== "*");
  const rawOrigin = (originOverride ?? configOrigins[0] ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  const origin = `https://${rawOrigin}`;
  const theme = config.theme;
  const name = theme?.name ?? "Game";
  const icon = resolveImageUrl(theme?.optimizedIcon, 64) ?? theme?.icon;
  const cover = resolveImageUrl(theme?.optimizedCover, 768);
  const rawPrimary = theme?.colors?.primary;
  const primary =
    typeof rawPrimary === "string"
      ? rawPrimary
      : typeof rawPrimary === "object" && rawPrimary && "dark" in rawPrimary
        ? rawPrimary.dark
        : undefined;

  return (
    <div className={cn(bannerVariants({ size, className }))} {...props}>
      {cover && (
        <div className="absolute top-0 left-0 w-full h-full">
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            style={{
              objectPosition:
                position !== undefined ? `center ${position}%` : "center",
            }}
          />
        </div>
      )}
      <div
        className="absolute top-0 left-0 h-full pr-8 md:pr-12 flex items-center gap-3 md:gap-4 px-4 md:px-6"
        style={{
          background:
            "linear-gradient(90deg, #000000 24%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        {icon && (
          <img
            src={icon}
            alt={name}
            className="w-9 h-9 md:w-12 md:h-12 rounded-lg border-[3px] border-white-700"
          />
        )}
        <div className="flex flex-col gap-1 md:gap-2 uppercase">
          <span
            className="text-lg/3 md:text-[22px]/[15px] text-white-100/60 tracking-wider translate-y-0.5"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              color: primary ?? "rgba(255,255,255,0.2)",
            }}
          >
            Play
          </span>
          <strong
            className="text-[28px]/[19px] md:text-[36px]/6 text-white-100 tracking-wider translate-y-0.5 font-thin"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {name}
          </strong>
        </div>
      </div>
      <div className="absolute right-4 md:right-6 bg-black-100 p-1 rounded-xl">
        {onClick ? (
          <Button
            className="h-9 md:h-10 px-2 md:px-3 py-1 text-black-100 rounded-lg hover:opacity-80"
            style={{ backgroundColor: primary ?? "rgba(255,255,255,0.2)" }}
            onClick={onClick}
          >
            <p
              className="text-[28px]/[19px] tracking-wider translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Play
            </p>
          </Button>
        ) : (
          <Button
            asChild
            className="h-9 md:h-10 px-2 md:px-3 py-1 text-black-100 rounded-lg hover:opacity-80"
            style={{ backgroundColor: primary ?? "rgba(255,255,255,0.2)" }}
          >
            <Link to={origin} target="_blank">
              <p
                className="text-[28px]/[19px] tracking-wider translate-y-0.5"
                style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
              >
                Play
              </p>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
