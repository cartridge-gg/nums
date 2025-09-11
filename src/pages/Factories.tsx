import {
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Table,
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
import { Jackpot, JackpotFactory, TokenTypeERC20 } from "../bindings";
import { useAccount } from "@starknet-react/core";
import { useClaim } from "../hooks/useClaim";
import { NextJackpot } from "../components/NextJackpot";
import { TokenBalanceUi } from "@/components/ui/token-balance";
import useChain from "@/hooks/chain";
import { getNumsAddress } from "@/config";
import { bigIntSerializer } from "@/utils/bigint";

const isPlayableJackpot = (jackpot: Jackpot) => {
  const hasEnded = Number(jackpot.end_at) * 1_000 <= Date.now();

  return !hasEnded;

  // // @ts-ignore
  // const isConditonnalVictory = jackpot.mode === "ConditionalVictory";
  // const hasWinner = Number(jackpot.total_winners) > 0;
};

const maybeNextJackpot = (factory: JackpotFactory, prevJackpot: Jackpot) => {
  if (factory.remaining_count.isNone()) {
    // should not happen, jackpot should be already created
    let virtualJackpot: Jackpot = {
      ...prevJackpot,
      nums_balance: 0,
      total_winners: 0,
    };
    return virtualJackpot;
  }

  if (factory.remaining_count.isSome()) {
    const remaining = factory.remaining_count.unwrap();
    if (remaining === 0) return undefined;

    const end_at =
      Math.ceil(Date.now() / 1_000) + Number(factory.initial_duration);

    let virtualJackpot: Jackpot = {
      ...prevJackpot,
      nums_balance: 0,
      total_winners: 0,
      token: factory.token,
      end_at,
    };

    return virtualJackpot;
  }
};

const getPlayableJackpot = (
  factory: JackpotFactory,
  jackpots: Jackpot[]
): Jackpot | undefined => {
  if (factory.current_jackpot_id.isSome()) {
    const currentJackpot = jackpots.find(
      (i) => i.id === factory.current_jackpot_id.unwrap()
    )!;
    if (currentJackpot && isPlayableJackpot(currentJackpot)) {
      return currentJackpot;
    } else {
      return maybeNextJackpot(factory, currentJackpot);
    }
  }
};

const Factories = () => {
  const { chain } = useChain();
  const { account } = useAccount();
  const { execute } = useExecuteCall();
  const { jackpots, jackpotFactories, getFactoryById, getClaimableByUser } =
    useJackpots();
  const navigate = useNavigate();

  const claimable = getClaimableByUser(account?.address || 0);
  const numsAddress = getNumsAddress(chain.id);

  if (!jackpotFactories || !jackpots) return null;
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
          <Grid maxW="1000px" templateColumns="repeat(2, 1fr)" gap={6}>
            {jackpotFactories.map((factory, idx) => {
              if (!factory) return null;
              const factoryJackpots =
                jackpots?.filter((i) => i.factory_id === factory.id) || [];

              const playableJackpot = getPlayableJackpot(
                factory,
                factoryJackpots
              );

              if (!playableJackpot) {
                return (
                  <GridItem
                    key={idx}
                    maxW="320px"
                    rounded={6}
                    p={6}
                    opacity={0.5}
                    layerStyle="transparent"
                    bgColor="rgba(0,0,0,0.04)"
                  >
                    <VStack h="full" justifyContent="space-between" gap="20px">
                      <VStack>
                        <Text fontFamily="Ekamai" fontSize="24px">
                          {factory.name}
                        </Text>
                        <Text>No playable jackpot</Text>
                      </VStack>
                      <Play
                        onReady={(gameId) => navigate(`/${gameId}`)}
                        w={["100%", "100%", "auto"]}
                        factory={factory}
                      />
                    </VStack>
                  </GridItem>
                );
              }

              // @ts-ignore
              const isPerpetual = factory.timing_mode === "Perpetual";
              const numsBalance =
                BigInt(playableJackpot.nums_balance) / 10n ** 18n;
              const date = new Date(
                Number(playableJackpot.end_at || 0) * 1_000
              );

              return (
                <GridItem
                  key={idx}
                  maxW="320px"
                  rounded={6}
                  p={6}
                  layerStyle="transparent"
                  bgColor="rgba(0,0,0,0.04)"
                >
                  <VStack h="full" justifyContent="space-between" gap="20px">
                    <VStack>
                      <Text fontFamily="Ekamai" fontSize="24px">
                        {factory.name}
                      </Text>

                      <VStack h="60px" alignItems="flex-end" justify="center">
                        <TokenBalanceUi
                          balance={numsBalance}
                          address={numsAddress}
                        />

                        {factory.token.isSome() &&
                          factory.token.unwrap().ty.activeVariant() ===
                            "ERC20" && (
                            <TokenBalanceUi
                              balance={
                                factory.token.unwrap().ty.variant["ERC20"]
                                  .amount /
                                10n ** 18n
                              }
                              address={factory.token.unwrap().address}
                            />
                          )}
                      </VStack>
                      <div>
                        End <TimeAgo date={date} />
                      </div>
                    </VStack>
                    <VStack>
                      <Play
                        onReady={(gameId) => navigate(`/${gameId}`)}
                        w={["100%", "100%", "auto"]}
                        factory={factory}
                      />
                    </VStack>
                  </VStack>
                </GridItem>
              );
            })}
          </Grid>
        </VStack>
        <Footer game={undefined} jackpot={undefined} />
      </Container>
    </>
  );
};

export default Factories;
