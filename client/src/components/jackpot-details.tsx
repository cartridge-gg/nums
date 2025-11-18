import makeBlockie from "ethereum-blockies-base64";
import { useEffect, useMemo, useState } from "react";
import { LiveIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Formatter } from "@/helpers/formatter";
import { usePrizesWithUsd } from "@/hooks/usePrizes";
import { cn } from "@/lib/utils";
import type { PrizeModel } from "@/models/prize";
import type { TournamentModel } from "@/models/tournament";

export const JackpotDetails = ({
  tournament,
  onOpenPrizeModal,
}: {
  tournament: TournamentModel | undefined;
  onOpenPrizeModal?: () => void;
}) => {
  const { prizes } = usePrizesWithUsd();

  const tournamentPrizes = useMemo(() => {
    if (!tournament) return [];
    return prizes.filter((p) => p.tournament_id === tournament.id);
  }, [prizes, tournament]);

  const totalPrizeUsd = useMemo(() => {
    const total = tournamentPrizes.reduce((sum, prize) => {
      if (prize.totalUsd) {
        return sum + parseFloat(prize.totalUsd);
      }
      return sum;
    }, 0);
    return total > 0 ? `$${total.toFixed(2)}` : "$0.00";
  }, [tournamentPrizes]);

  const started = useMemo(() => {
    return tournament?.hasStarted() || false;
  }, [tournament]);

  const ended = useMemo(() => {
    return tournament?.hasEnded() || false;
  }, [tournament]);

  const [remainingTime, setRemainingTime] = useState<string | undefined>();

  useEffect(() => {
    if (!tournament || ended) return;
    setRemainingTime(
      Formatter.time(tournament.end_time.getTime() - Date.now()),
    );
    const interval = setInterval(() => {
      const remainingTime = tournament.end_time.getTime() - Date.now();
      setRemainingTime(Formatter.time(remainingTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament, ended, started]);

  if (!tournament) {
    return (
      <div
        className={cn(
          "h-[76px] select-none flex flex-col gap-2 md:gap-6 w-full rounded-lg p-4 md:p-6 bg-[rgba(0,0,0,0.04)]",
          tournamentPrizes.length === 0
            ? "pointer-events-none"
            : "cursor-pointer",
        )}
        style={{
          boxShadow:
            "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
        }}
      >
        <p className="text-purple-300 text-2xl/3 m-auto">Budokan game</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "select-none flex flex-col gap-2 md:gap-6 w-full rounded-lg p-4 md:p-6 bg-[rgba(0,0,0,0.04)]",
        tournamentPrizes.length === 0
          ? "pointer-events-none"
          : "cursor-pointer",
      )}
      style={{
        boxShadow:
          "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (tournamentPrizes.length === 0) return;
        onOpenPrizeModal?.();
      }}
    >
      <div className="flex gap-2 justify-between items-center">
        <h2
          className="text-[28px]/[19px] md:text-4xl/[24px] uppercase translate-y-0.5"
          style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Jackpot #{tournament.id}
        </h2>
        <div className="flex items-center gap-2 md:gap-3">
          <PrizePoolTokens prizes={tournamentPrizes} />
          <span
            className="text-[28px]/[19px] md:text-4xl/[24px] uppercase translate-y-0.5"
            style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {totalPrizeUsd}
          </span>
        </div>
      </div>
      <div className="flex flex-row-reverse gap-2 justify-between items-center max-h-3 translate-y-0.5">
        {ended ? (
          <div className="text-purple-300 leading-[12px]">
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <p className="hidden md:block">Tournament completed</p>
              <p className="block md:hidden">Completed</p>
            </span>
          </div>
        ) : !started ? (
          <div className="flex gap-2 justify-between text-purple-300 leading-[12px] translate-y-0.5">
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <p className="hidden md:block">Tournament starts in:</p>
              <p className="block md:hidden">Starts in:</p>
            </span>
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {Formatter.time(tournament.start_time.getTime() - Date.now())}
            </span>
          </div>
        ) : (
          <div className="flex gap-2 justify-between text-purple-300 leading-[12px] translate-y-0.5">
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <p className="hidden md:block">Tournament ends in:</p>
              <p className="block md:hidden">Ends in:</p>
            </span>
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {remainingTime}
            </span>
          </div>
        )}
        <div
          className={cn(
            "flex gap-2 items-center",
            (!started || ended) && "hidden",
          )}
        >
          <div className="animate-pulse hidden md:block">
            <LiveIcon />
          </div>
          <p
            className="text-lg leading-[12px] uppercase text-green-100 translate-y-0.5"
            style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Active
          </p>
        </div>
      </div>
    </div>
  );
};

export const PrizePoolTokens = ({ prizes }: { prizes: PrizeModel[] }) => {
  return (
    <div className="select-none flex justify-center items-center bg-purple-600 rounded-full p-0.5">
      {prizes.map((prize, index) => (
        <div
          key={prize.address}
          className={cn(
            "flex items-center justify-center h-5 w-5 relative",
            index > 0 && "ml-[-8px]",
          )}
        >
          <img
            draggable={false}
            src={prize.metadata?.logoUrl || makeBlockie(prize.address)}
            alt={prize.metadata?.name || "Token"}
            className="size-5 rounded-full"
          />
        </div>
      ))}
    </div>
  );
};

export const PrizePoolModal = ({
  prizes,
  setModal,
}: {
  prizes: PrizeModel[];
  setModal: (modal: boolean) => void;
}) => {
  return (
    <div
      className="select-none w-full max-w-[400px] bg-black-300 border-[2px] border-black-300 backdrop-blur-[16px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-lg p-6 flex flex-col gap-6"
      style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <h2
        className="text-white-100 tracking-wide text-[36px]/6 text-center"
        style={{ textShadow: "4px 4px 0px rgba(28, 3, 101, 1)" }}
      >
        Prize Pool
      </h2>
      <div className="flex flex-col gap-3">
        {prizes.map((prize) => (
          <div
            key={prize.address}
            className="h-16 flex items-center justify-between gap-3 px-3 rounded-xl bg-purple-700"
          >
            <div className="flex items-center justify-center h-10 w-10 bg-purple-700 p-0.5 rounded-full">
              <img
                draggable={false}
                src={prize.metadata?.logoUrl || makeBlockie(prize.address)}
                alt={prize.metadata?.name || "Token"}
                className="size-9 rounded-full"
              />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <strong
                  className="text-white-100 text-[28px]/[19px] translate-y-0.5 tracking-wide"
                  style={{ textShadow: "4px 4px 0px rgba(28, 3, 101, 1)" }}
                >
                  {`${Number(prize.formattedAmount).toLocaleString() || "-"} ${prize.metadata?.symbol || ""}`}
                </strong>
              </div>
              <span className="text-white-400 text-2xl/3 font-ppneuebit">
                {prize.totalUsd ? `$${prize.totalUsd}` : "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        className="w-full px-6 py-1"
        onClick={() => setModal(false)}
      >
        <p
          className="text-[28px]/[19px] tracking-wide translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Close
        </p>
      </Button>
    </div>
  );
};
