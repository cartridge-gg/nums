import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import SlotCounter from "react-slot-counter";
import background from "/assets/numbers.svg";
import { Countup } from "@/components/animations";
import { useCallback, useEffect, useState } from "react";
import { CartridgeIcon, DojoIcon, StarknetIcon } from "@/components/icons";

export interface WelcomeSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof welcomeSceneVariants> {
  isDismissing?: boolean;
}

const welcomeSceneVariants = cva(
  "select-none relative flex justify-center items-center",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "h-full w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const WelcomeScene = ({
  variant,
  className,
  onClick,
  isDismissing = false,
  ...props
}: WelcomeSceneProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 3000);
    const t2 = setTimeout(() => setPhase(2), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (phase !== 2 || !onClick) return;
      onClick(event);
    },
    [phase, onClick],
  );

  return (
    <div
      className={cn(
        welcomeSceneVariants({ variant, className }),
        phase === 2 && !isDismissing && "cursor-pointer",
        "transition-opacity duration-1000",
        isDismissing && "opacity-0 pointer-events-none",
      )}
      onClick={handleClick}
      {...props}
    >
      <div className="absolute inset-0 bg-[#4F1CDE]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.12) 100%)",
        }}
      />
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          maskImage:
            "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
          maskSize: "cover",
          WebkitMaskSize: "cover",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 70% at 50% 50%, #4F1CDF 44%, rgba(79, 28, 223, 0) 100%)",
        }}
      />
      <div className="flex flex-col gap-16 m-auto relative">
        <div className="flex flex-col items-center gap-4">
          <Countup className="h-[80px] md:h-[120px] w-full" />
          <div
            className="text-[80px]/[54px] md:text-[160px]/[109px] translate-y-2 overflow-clip"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            <SlotCounter
              value="NUMS.GG"
              startValue="       "
              startValueOnce
              duration={3}
              dummyCharacters={[
                "N",
                "U",
                "M",
                "S",
                ".",
                "G",
                "G",
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
              ]}
              separatorCharacters={[]}
              animateOnVisible={false}
              useMonospaceWidth={false}
            />
          </div>
          <p className="flex items-center justify-center gap-3 uppercase overflow-hidden">
            <strong
              className={cn(
                "text-[24px]/[16px] md:text-[32px]/[22px] text-green-100 tracking-wider transition-all duration-1000",
                phase >= 1
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0",
              )}
            >
              Play Nums
            </strong>
            <span
              className={cn(
                "text-[24px]/[16px] md:text-[32px]/[22px] text-white-100 translate-y-[6px] transition-opacity duration-1000",
                phase >= 1 ? "opacity-100" : "opacity-0",
              )}
            >
              *
            </span>
            <strong
              className={cn(
                "text-[24px]/[16px] md:text-[32px]/[22px] text-yellow-100 tracking-wider transition-all duration-1000",
                phase >= 1
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0",
              )}
            >
              Earn Nums
            </strong>
          </p>
        </div>
        <p
          className={cn(
            "font-secondary text-[24px] md:text-[32px] tracking-wider text-center animate-shimmer-reflect transition-opacity duration-1000",
            phase >= 2 ? "opacity-100" : "opacity-0",
          )}
        >
          Start Sorting
        </p>
      </div>
      <div
        className="absolute bottom-0 right-1/2 translate-x-1/2 md:right-0 md:-translate-x-0 p-10 flex gap-4 items-center text-white-500"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #4F1CDF 44%, rgba(79, 28, 223, 0) 100%)",
        }}
      >
        <p className="text-[24px]/3 md:text-[28px]/[14px] tracking-wider font-secondary whitespace-nowrap">
          Powered by
        </p>
        <div className="flex gap-2 items-center">
          <CartridgeIcon className="h-7 w-7 md:h-8 md:w-8" />
          <DojoIcon className="h-7 w-7 md:h-8 md:w-8" />
          <StarknetIcon className="h-7 w-7 md:h-8 md:w-8" />
        </div>
      </div>
    </div>
  );
};
