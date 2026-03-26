import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useId, useRef, useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import {
  ShadowEffect,
  ExternalLinkIcon,
  AsteriskIcon,
} from "@/components/icons";
import { Close } from "@/components/elements";
import { Link } from "@/lib/router";

export interface AirdropProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof airdropVariants> {
  count: number;
  loading?: boolean;
  onClaim: () => void;
  onClose: () => void;
}

const airdropVariants = cva(
  "h-auto w-full select-none flex flex-col gap-6 p-6 md:gap-10 md:p-12 relative",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-200 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Airdrop = ({
  count,
  loading,
  onClaim,
  onClose,
  variant,
  className,
  ...props
}: AirdropProps) => {
  const filterId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(airdropVariants({ variant, className }), "overflow-hidden")}
      {...props}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <ShadowEffect filterId={filterId} />

      <Close
        size="lg"
        onClick={onClose}
        className="absolute z-10 top-6 right-6 hidden md:flex"
      />

      <div className="flex items-center justify-between">
        <h2
          className="font-primary text-[36px]/[24px] md:text-[48px]/[33px] tracking-wider uppercase translate-y-1"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Airdrop
        </h2>
        <Close size="md" className="md:hidden" onClick={onClose} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-lg/3 tracking-wide translate-y-0.5 text-white-400">
            You Receive
          </p>
          <p
            className="text-[36px]/[24px] md:text-[48px]/[33px] tracking-wide translate-y-1 text-green-100 font-thin"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {`${count} Game${count > 1 ? "s" : ""}`}
          </p>
        </div>

        <p className="font-sans text-base/5 text-white-100">
          You have participated in the Starknet Gaming Ecosystem and are
          eligible to receive an airdrop.
        </p>

        <Link
          to="https://docs.nums.gg/airdrop"
          target="_blank"
          className="flex"
        >
          <div className="px-2 flex items-center gap-0.5 h-8 bg-white-900 hover:bg-white-800 rounded transition-colors duration-150">
            <p className="font-sans text-base/5 text-white-100 px-0.5">
              Read More
            </p>
            <ExternalLinkIcon size="xs" />
          </div>
        </Link>

        <div className="flex bg-white-900 rounded-lg p-3 gap-2">
          <div className="flex items-center justify-center min-w-5 h-5 bg-white-900 rounded">
            <AsteriskIcon size="2xs" />
          </div>
          <p className="font-sans text-sm leading-normal text-white-100">
            Games will expire 24hrs after claim
          </p>
        </div>
      </div>

      <Button
        variant="default"
        className="h-10 md:h-12 w-full bg-green-100 hover:bg-green-200"
        loading={loading}
        disabled={loading}
        onClick={onClaim}
      >
        <span
          className="text-[28px]/[19px] tracking-wide translate-y-0.5 text-gray-100"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Claim
        </span>
      </Button>
    </div>
  );
};
