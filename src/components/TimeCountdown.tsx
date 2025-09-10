import { VStack, Text, Box } from "@chakra-ui/react";
import { TimeAgo } from "./ui/time-ago";
import { Game } from "@/bindings";
import { useMemo } from "react";

import Countdown from "react-countdown";
import { BigNumberish } from "starknet";

const TimeUp = () => <Text color="red">Time's Up !</Text>;
const GameOver = () => <Text color="red">Game Over !</Text>;

// Renderer callback with condition
const renderer = ({
  hours,
  minutes,
  seconds,
  completed,
}: {
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  return (
    <>
      {completed && <TimeUp />}
      {!completed && (
        <Text>
          {hours > 0 && <>{hours.toString().padStart(2, "0")}:</>}
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </Text>
      )}
    </>
  );
};
export const TimeCountdown = ({
  timestampSec,
  gameOver,
  fontSize = ["14px", "16px", "16px"],
}: {
  timestampSec: BigNumberish;
  gameOver?: boolean;
  fontSize?: string[];
}) => {
  const date = useMemo(() => {
    return new Date(Number(timestampSec) * 1_000);
  }, [timestampSec]);

  return (
    <Box
      fontSize={fontSize}
      fontFamily="Ekamai"
      textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)"
    >
      {gameOver && <GameOver />}
      {!gameOver && <Countdown date={date} renderer={renderer} />}
    </Box>
  );
};
