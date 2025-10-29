import { useEffect, useMemo, useState } from "react";
import { LiveIcon } from "@/components/icons/Live";
import { Formatter } from "@/helpers/formatter";
import { cn } from "@/lib/utils";
import type { TournamentModel } from "@/models/tournament";

export const JackpotDetails = ({
  tournament,
}: {
  tournament: TournamentModel;
}) => {
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
        <span
          className="text-4xl leading-[24px] uppercase"
          style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
        >
          $521.15
        </span>
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
