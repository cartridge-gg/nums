import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { useModal } from "@/context/modal";
import { Formatter } from "@/helpers";
import { usePlayerGames } from "@/hooks/useAssets";
import { useStarterpackClaim } from "@/hooks/useStarterpackClaim";
import { useStarterpackPrice } from "@/hooks/useStarterpackPrice";
import { useStarterpacks } from "@/hooks/useStarterpacks";
import type { TournamentModel } from "@/models/tournament";
import { Games } from "./games";
import { Button } from "./ui/button";

export type InventoryProps = {};

export const Inventory = ({ tournament }: { tournament?: TournamentModel }) => {
  const { isInventoryClosing, closeInventory, finalizeCloseInventory } =
    useModal();
  const { gameIds } = usePlayerGames();
  const [isLoading, setIsLoading] = useState(false);
  const initialGameCountRef = useRef<number>(0);

  useEffect(() => {
    if (isInventoryClosing) {
      const timeoutId = setTimeout(() => {
        finalizeCloseInventory();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isInventoryClosing, finalizeCloseInventory]);

  // Detect when gameIds changes after a purchase
  useEffect(() => {
    if (isLoading && gameIds.length > initialGameCountRef.current) {
      // New game detected, stop loading
      setIsLoading(false);
    }
  }, [gameIds, isLoading]);

  return (
    <div
      className="w-full h-full select-none"
      style={{
        transform: isInventoryClosing
          ? "scaleY(0.005) scaleX(0)"
          : "scaleY(1) scaleX(1)",
        animation: isInventoryClosing
          ? "unfoldOut 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards"
          : "unfoldIn 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full h-full rounded-2xl bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] p-6"
        style={{
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          transform: isInventoryClosing ? "scale(0)" : "scale(1)",
          animation: isInventoryClosing
            ? "zoomOut 0.5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards"
            : "zoomIn 0.5s 0.8s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards both",
        }}
      >
        <Close close={closeInventory} />
        <div className="max-w-[784px] mx-auto pt-16 md:py-[120px] flex flex-col gap-6 h-full overflow-hidden">
          <div className="flex flex-col items-start gap-6">
            {tournament && <Header tournament={tournament} />}
            <Purchases />
          </div>
          <Games tournament={tournament} />
        </div>
      </div>
    </div>
  );
};

export const Close = ({ close }: { close: () => void }) => {
  return (
    <Button
      variant="ghost"
      className="h-10 w-10 md:h-12 md:w-14 p-2 md:px-6 md:py-4 absolute top-6 right-6 [&_svg]:size-6 md:[&_svg]:size-8 bg-white-900 hover:bg-white-800 rounded-lg"
      onClick={close}
    >
      <CloseIcon size="lg" />
    </Button>
  );
};

export const Header = ({ tournament }: { tournament: TournamentModel }) => {
  const started = useMemo(() => {
    return tournament.hasStarted();
  }, [tournament]);

  const ended = useMemo(() => {
    return tournament.hasEnded();
  }, [tournament]);

  const [remainingTime, setRemainingTime] = useState<string | undefined>();

  useEffect(() => {
    if (ended) return;
    setRemainingTime(
      Formatter.time(tournament.end_time.getTime() - Date.now()),
    );
    const interval = setInterval(() => {
      const remainingTime = tournament.end_time.getTime() - Date.now();
      setRemainingTime(Formatter.time(remainingTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament, ended, started]);

  return (
    <div className="flex flex-col items-start md:gap-2">
      <h1
        className="text-[36px] md:text-[68px] leading-[42px] uppercase translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Enter Jackpot #{tournament.id}
      </h1>
      <p
        className="text-lg leading-[12px] tracking-wide text-white-400 translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        <span className="hidden md:block">
          Tournament ends in: {remainingTime}
        </span>
        <span className="block md:hidden">Ends in: {remainingTime}</span>
      </p>
    </div>
  );
};

export const Purchases = ({}: {}) => {
  const { address, connector } = useAccount();
  const { starterpacks } = useStarterpacks();
  const { claims } = useStarterpackClaim(address ?? "0x0");
  const { freePack, payPack } = useMemo(() => {
    return {
      freePack: starterpacks.find((starterpack) => !starterpack.reissuable),
      payPack: starterpacks.find((starterpack) => starterpack.reissuable),
    };
  }, [starterpacks]);

  const usdPrice = useStarterpackPrice(payPack?.price, payPack?.payment_token);

  const freeOpen = useCallback(async () => {
    if (!freePack) return;
    (connector as ControllerConnector)?.controller.openStarterPack(
      freePack.id.toString(),
    );
  }, [connector, freePack]);

  const payOpen = useCallback(async () => {
    if (!payPack) return;
    (connector as ControllerConnector)?.controller.openStarterPack(
      payPack.id.toString(),
    );
  }, [connector, payPack]);

  const payText = useMemo(() => {
    if (!payPack) return "N/A";
    if (usdPrice) {
      return `$${usdPrice}`;
    }
    const priceInTokens = Number(payPack.price / 10n ** 18n);
    return `${priceInTokens.toFixed(0)} NUMS`;
  }, [usdPrice, payPack]);

  return (
    <ul className="flex justify-between gap-3 md:gap-6 w-full">
      <PurchaseMethod
        title="Claim for Free"
        buttonText={claims.length === 0 ? "Free!" : "Claimed!"}
        onClick={claims.length === 0 ? freeOpen : undefined}
      />
      <PurchaseMethod
        title="Buy Starterpack"
        buttonText={payText}
        onClick={payOpen}
      />
    </ul>
  );
};

export const PurchaseMethod = ({
  title,
  buttonText,
  onClick,
  isLoading,
}: {
  title: string;
  buttonText: string;
  onClick?: () => void;
  isLoading?: boolean;
}) => {
  const disabled = useMemo(() => {
    return !onClick || isLoading;
  }, [onClick, isLoading]);

  return (
    <div className="w-1/2 rounded-lg bg-white-900 border border-white-900 p-3 flex flex-col gap-4">
      <h3 className="font-ppneuebit text-xl/[10px] md:text-2xl/3 pt-2">
        {title}
      </h3>
      <Button
        disabled={disabled}
        variant="default"
        className="w-full h-10 px-2.5"
        onClick={onClick}
      >
        {isLoading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <p
            className="text-[28px] translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            {buttonText}
          </p>
        )}
      </Button>
    </div>
  );
};
