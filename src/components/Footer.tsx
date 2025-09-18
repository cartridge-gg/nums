import { Box, HStack } from "@chakra-ui/react";
import useChain from "@/hooks/chain";
import { Game, Jackpot } from "@/bindings";

import { JackpotDetails } from "./JackpotDetails";

export const Footer = ({
  game,
  jackpot,
}: {
  game?: Game;
  jackpot?: Jackpot;
}) => {
  const { chain } = useChain();

  return (
    <HStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      w="full"
      h={["60px","70px"]}
      p={["4px", "8px"]}
      bg="linear-gradient(0deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.16) 100%), {colors.purple.100}"
    >
      {/* @ts-ignore */}
      {game && jackpot && ( <JackpotDetails game={game} jackpotId={jackpot.id} w="full" /> )}
    </HStack>
  );
};
