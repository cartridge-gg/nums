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
import { useClaim } from "../hooks/useClaim";
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

const Selection = () => {
  const { account } = useAccount();
  const { execute } = useExecuteCall();
  const { jackpots, jackpotFactories, getFactoryById, getClaimableByUser } =
    useJackpots();

  const claimable = getClaimableByUser(account?.address || 0);
  // console.log(claimable);

  if (!jackpots) return null;
  return (
    <>
      <Container h={["100dvh","100vh"]} maxW="100vw">
        <Header />

        <VStack
          h={["auto", "auto", "full"]}
          justify={["flex-start", "flex-start", "flex-start"]}
          pt={["90px", "90px", "140px"]}
          top="140px"
          maxH="calc(100vh - 100px)"
          overflow="auto"
        >
          <Grid maxW="1000px" templateColumns="repeat(3, 1fr)" gap={6}>
            {jackpots
              // .filter((i) => isJackpotActive(i))
              .map((jackpot, idx) => {
                const factory = getFactoryById(jackpot.factory_id);
                const numsBalance = BigInt(jackpot.nums_balance) / 10n ** 18n;
                const date = new Date(Number(jackpot.end_at) * 1_000);
                let remaining = 0;

                let tokenBalance = 0n;
                if (jackpot?.token.isSome()) {
                  //
                  const token = jackpot.token.unwrap();

                  switch ((token.ty as CairoCustomEnum).activeVariant()) {
                    case "ERC20":
                      const values = (token.ty as CairoCustomEnum).variant[
                        "ERC20"
                      ] as TokenTypeERC20;
                      tokenBalance = BigInt(values.amount) / 10n ** 18n;
                      //   return amount_by_jackpot.toLocaleString();
                      break;
                    default:
                      break;
                  }
                }

                const canClaim = claimable?.some((i) => i.id === jackpot.id);

                // @ts-ignore
                const isPerpetual = factory?.timing_mode === "Perpetual";

                if (factory?.remaining_count.isSome()) {
                  remaining = factory.remaining_count.unwrap();
                }
                const active = isJackpotActive(jackpot);

                if (!factory) return null;
                return (
                  <GridItem
                    key={idx}
                    maxW="320px"
                    border="solid 1px"
                    rounded={6}
                    p={3}
                    opacity={active ? 1 : 0.5}
                  >
                    <div># {jackpot.id.toString()}</div>
                    <Text fontFamily="Ekamai" fontSize="24px">
                      {factory.name}
                    </Text>

                    {/* @ts-ignore */}
                    {/* <div>{jackpot.mode}</div> */}
                    {/* @ts-ignore */}
                    {/* <div>{factory?.timing_mode}</div> */}

                    <div>{numsBalance.toLocaleString()} NUMS</div>
                    {tokenBalance > 0n && (
                      <div>{tokenBalance.toLocaleString()} REW</div>
                    )}
                    <div>total winner: {Number(jackpot.total_winners)}</div>

                    {!isPerpetual && (
                      <>
                        <div>
                          End <TimeAgo date={date} />
                        </div>

                        {remaining > 0 && (
                          <div>remaining jackpots : {remaining}</div>
                        )}
                      </>
                    )}

                    {/* {active && (
                      <Play
                        onReady={(gameId) => navigate(`/${gameId}`)}
                        w={["100%", "100%", "auto"]}
                        jackpotId={jackpot.id}
                      />
                    )} */}
                    {/* {!active &&
                      ((factory.remaining_count.isSome() &&
                        factory.remaining_count.unwrap() > 0) ||
                        (factory.timing_mode === "Perpetual")) && ( */}
                    <NextJackpot factoryId={factory.id} />
                    {/* )} */}

                    {/* {canClaim && <useClaim jackpotId={jackpot.id} />}
                    {!canClaim && (
                      <>
                        Not claimable / already claimed
                        <useClaim jackpotId={jackpot.id} />
                      </>
                    )} */}
                  </GridItem>
                );
              })}
          </Grid>
        </VStack>
        <Footer game={undefined} jackpot={undefined}  />
      </Container>
    </>
  );
};

export default Selection;
