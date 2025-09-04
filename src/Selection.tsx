import {
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Button } from "./components/Button";

import Header from "./components/Header";

import { useExecuteCall } from "./hooks/useExecuteCall";
import { Footer } from "./components/Footer";
import { useJackpots } from "./context/jackpots";
import { TimeAgo } from "./components/ui/time-ago";
import Play from "./components/Play";
import { useNavigate } from "react-router-dom";
import { Jackpot } from "./bindings";

const isJackpotActive = (jackpot: Jackpot) => {
  return (
    Number(jackpot.end_at) * 1_000 > Date.now() &&
    !(
      // @ts-ignore
      (
        jackpot.mode === "ConditionalVictory" &&
        Number(jackpot.total_winners) > 0
      )
    )
  );
};

const Selection = () => {
  const { execute } = useExecuteCall();
  const { jackpots, jackpotFactories, getFactoryById } = useJackpots();
  const navigate = useNavigate();

  if (!jackpots) return null;
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
          <Grid maxW="1000px" templateColumns="repeat(3, 1fr)" gap={6}>
            {jackpots
              // .filter((i) => isJackpotActive(i))
              .map((jackpot) => {
                const factory = getFactoryById(jackpot.factory_id);
                const numsBalance = BigInt(jackpot.nums_balance) / 10n ** 18n;
                const date = new Date(Number(jackpot.end_at) * 1_000);
                let remaining = 0;

                // @ts-ignore
                const isPerpetual = factory?.timing_mode === "Perpetual";

                if (factory?.remaining_count.isSome()) {
                  remaining = factory.remaining_count.unwrap();
                }
                const active = isJackpotActive(jackpot);

                if (!factory) return null;
                return (
                  <GridItem
                    maxW="320px"
                    border="solid 1px"
                    rounded={6}
                    p={3}
                    opacity={active ? 1 : 0.5}
                  >
                    <Text fontFamily="Ekamai" fontSize="24px">
                      {factory.name}
                    </Text>
                    {/* @ts-ignore */}
                    <div>{jackpot.mode}</div>
                    {/* @ts-ignore */}
                    <div>{factory?.timing_mode}</div>
                    <div># {jackpot.id.toString()}</div>
                    <div>{numsBalance.toLocaleString()} NUMS</div>

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

                    {active && (
                      <Play
                        onReady={(gameId) => navigate(`/${gameId}`)}
                        w={["100%", "100%", "auto"]}
                        jackpotId={jackpot.id}
                      />
                    )}
                    {!active &&
                      factory.remaining_count.isSome() &&
                      factory.remaining_count.unwrap() > 0 && (
                        <Play
                          label="Relaunch"
                          onReady={(gameId) => navigate(`/${gameId}`)}
                          w={["100%", "100%", "auto"]}
                          jackpotId={jackpot.id}
                        />
                      )}
                  </GridItem>
                );
              })}
          </Grid>
        </VStack>
        <Footer game={undefined} jackpot={undefined} winners={undefined} />
      </Container>
    </>
  );
};

export default Selection;
