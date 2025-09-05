import { VStack } from "@chakra-ui/react";

import { TimeAgo } from "./ui/time-ago";
import { Game } from "@/bindings";

export const GameInfos = ({ game }: { game: Game }) => {
  if (!game) return null;

  return (
    <VStack
      border="solid 1px"
      p={1}
      gap={1}
      fontSize="xs"
      position="absolute"
      top={"95px"}
      right={"0px"}
      width="auto"
      zIndex={99}
      userSelect="text"
      //   pointerEvents="none"
    >
      <div>Game #{game?.game_id.toString()}</div>
      {/* @ts-ignore */}
      <div>
        End <TimeAgo date={new Date(Number(game.expires_at) * 1_000)} />
      </div>
      {/* <div>{JSON.stringify(jackpot, bigIntSerializer, 2)}</div>
      <div>{JSON.stringify(factory, bigIntSerializer, 2)}</div> */}
    </VStack>
  );
};
