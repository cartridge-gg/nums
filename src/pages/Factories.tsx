import {
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  useAccordion,
  VStack,
} from "@chakra-ui/react";
import { Button } from "../components/Button";

import Header from "../components/Header";

import { useExecuteCall } from "../hooks/useExecuteCall";
import { Footer } from "../components/Footer";
import { useJackpots } from "../context/jackpots";
import { TimeAgo } from "../components/ui/time-ago";
import Play from "../components/Play";
import { useNavigate } from "react-router-dom";
import { Jackpot, TokenTypeERC20 } from "../bindings";
import { CairoCustomEnum } from "starknet";
import { useAccount } from "@starknet-react/core";
import { Claim } from "../components/Claim";
import { NextJackpot } from "../components/NextJackpot";

const isJackpotActive = (jackpot: Jackpot) => {
  return (
    Number(jackpot.end_at) * 1_000 > Date.now()
    // ||
    // (
    //   // @ts-ignore

    //     jackpot.mode === "ConditionalVictory" &&
    //     Number(jackpot.total_winners) > 0

    // )
  );
};

const Factories = () => {
  const { account } = useAccount();
  const { execute } = useExecuteCall();
  const { jackpots, jackpotFactories, getFactoryById, getClaimableByUser } =
    useJackpots();
  const navigate = useNavigate();

  const claimable = getClaimableByUser(account?.address || 0);
  console.log(claimable);

  if (!jackpotFactories) return null;
  return (
    <>
      <Container h="100vh" maxW="100vw">
        <Header />

        <VStack
          h={["auto", "auto", "full"]}
          justify={["flex-start", "flex-start", "flex-start"]}
          pt={["90px", "90px", "140px"]}
          top="140px"
          maxH="calc(100vh - 100px)"
          overflow="auto"
        >
          {jackpotFactories.map((factory, idx) => {
            let remaining = 0;
            if (factory?.remaining_count.isSome()) {
              remaining = factory.remaining_count.unwrap();
            }

            return (
              <VStack w="full">
                <div>{factory.name}</div>
                <div>remaing: {remaining}</div>
              </VStack>
            );
          })}
        </VStack>
        <Footer game={undefined} jackpot={undefined} winners={undefined} />
      </Container>
    </>
  );
};

export default Factories;
