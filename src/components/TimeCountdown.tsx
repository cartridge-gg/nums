import { VStack, Text } from "@chakra-ui/react";
import { TimeAgo } from "./ui/time-ago";
import { Game } from "@/bindings";
import { useMemo } from "react";

import Countdown from "react-countdown";
import { BigNumberish } from "starknet";

const TimeUp = () => (
  <Text
    fontSize="36px"
    fontFamily="Ekamai"
    textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)"
    color="red"
  >
    Time Up !
  </Text>
);
const GameOver = () => (
  <Text
    fontSize="36px"
    fontFamily="Ekamai"
    textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)"
    color="red"
  >
    Game Over !
  </Text>
);

// Renderer callback with condition
const renderer = ({
  // hours,
  minutes,
  seconds,
  completed,
}: {
  // hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  if (completed) {
    // Render a completed state
    return <TimeUp />;
  } else {
    // Render a countdown
    return (
      <Text
        fontSize="36px"
        fontFamily="Ekamai"
        textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)"
      >
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </Text>
    );
  }
};
export const TimeCountdown = ({
  timestampSec,
  gameOver,
}: {
  timestampSec: BigNumberish;
  gameOver?: boolean;
}) => {
  if (gameOver) return <GameOver />;

  const date = useMemo(() => {
    return new Date(Number(timestampSec) * 1_000);
  }, [timestampSec]);

  return <Countdown date={date} renderer={renderer} />;
};
