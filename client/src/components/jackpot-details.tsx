import makeBlockie from "ethereum-blockies-base64";
import { useEffect, useMemo, useState } from "react";
import { InfoIcon } from "@/components/icons/Info";
import { LiveIcon } from "@/components/icons/Live";
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
  tournament: TournamentModel;
  onOpenPrizeModal?: () => void;
}) => {
  const { prizes } = usePrizesWithUsd();

  const tournamentPrizes = useMemo(() => {
    return prizes.filter((p) => p.tournament_id === tournament.id);
  }, [prizes, tournament.id]);

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
    <div
      className="select-none flex flex-col gap-6 w-full rounded-lg p-6 bg-[rgba(0,0,0,0.04)]"
      style={{
        boxShadow:
          "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="flex gap-2 justify-between items-center">
        <h2
          className="text-4xl leading-[24px] uppercase"
          style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Jackpot #{tournament.id}
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="text-4xl leading-[24px] uppercase"
            style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {totalPrizeUsd}
          </span>
          {onOpenPrizeModal && (
            <div
              className="hover:cursor-pointer transition-colors duration-100 hover:text-purple-400 text-purple-300 [&_svg]:size-6"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPrizeModal();
              }}
            >
              <InfoIcon />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row-reverse gap-2 justify-between items-center max-h-3">
        {ended ? (
          <div className="text-purple-300 leading-[12px]">
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              Tournament completed
            </span>
          </div>
        ) : !started ? (
          <div className="flex gap-2 justify-between text-purple-300 leading-[12px]">
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              Tournament starts in:
            </span>
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {Formatter.time(tournament.start_time.getTime() - Date.now())}
            </span>
          </div>
        ) : (
          <div className="flex gap-2 justify-between text-purple-300 leading-[12px]">
            <span
              className="text-lg"
              style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
            >
              Tournament ends in:
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
          <div className="animate-pulse">
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

export const PrizePoolModal = ({
  prizes,
  setModal,
}: {
  prizes: PrizeModel[];
  setModal: (modal: boolean) => void;
}) => {
  return (
    <div
      className="min-h-64 w-[360px] bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] rounded-lg p-6 flex flex-col gap-6"
      style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <h2 className="text-white-100 tracking-wider text-[28px]/[19px] translate-y-0.5 text-center">
        Prize Pool
      </h2>
      <div className="flex flex-col gap-3">
        {prizes.map((prize) => (
          <div
            key={prize.address}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <img
                src={prize.metadata?.logoUrl || makeBlockie(prize.address)}
                alt={prize.metadata?.name || "Token"}
                className="size-8 rounded-full"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white-400 text-lg/4 bg-black-500 px-2 pt-1 pb-0.5 rounded -translate-y-px">
                {prize.totalUsd ? `$${prize.totalUsd}` : "-"}
              </span>
              <span className="text-white-100 text-2xl">
                {prize.formattedAmount || "-"}
              </span>
              <strong className="text-white-100 text-2xl">
                {prize.metadata?.symbol || ""}
              </strong>
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
          className="text-[28px]/[19px] tracking-wider translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Close
        </p>
      </Button>
    </div>
  );
};
