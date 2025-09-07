import {
  VStack,
  Text,
  Container,
  Box,
  HStack,
  Spacer,
  useDisclosure,
  useBreakpointValue,
  ScrollArea,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import Header from "../components/Header";
import { Tooltip } from "@/components/ui/tooltip";
import { TrophyIcon } from "../components/icons/Trophy";
import { Button } from "../components/Button";
import { InfoIcon } from "../components/icons/Info";
import { CaretIcon } from "../components/icons/Caret";
import InfoOverlay from "../components/Info";
import { MintNums } from "../components/MintNums";
import { Footer } from "../components/Footer";
import { useJackpots } from "@/context/jackpots";
import { Jackpot, JackpotFactory, TokenTypeERC20 } from "@/bindings";
import { TokenBalanceUi } from "@/components/ui/token-balance";
import useChain from "@/hooks/chain";
import { getNumsAddress } from "@/config";
import { useControllers } from "@/context/controllers";
import { shortAddress } from "@/utils/address";
import { LuCrown } from "react-icons/lu";
import { useClaim } from "@/hooks/useClaim";
import { CairoCustomEnum } from "starknet";

const Home = () => {
  const navigate = useNavigate();
  const {
    open: openInfo,
    onOpen: onOpenInfo,
    onClose: onCloseInfo,
  } = useDisclosure();
  const { account } = useAccount();
  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { findController } = useControllers();
  const { claim } = useClaim();

  const { jackpots, jackpotFactories, getWinnersById } = useJackpots();

  const [selectedFactory, setSelectedFactory] = useState<JackpotFactory>();
  const [selectedJackpots, setSelectedJackpots] = useState<Jackpot[]>([]);
  // return <ComingSoon />;

  useEffect(() => {
    if (jackpotFactories && jackpotFactories.length > 0 && !selectedFactory) {
      setSelectedFactory(jackpotFactories[0]);
    }
  }, [jackpotFactories]);

  useEffect(() => {
    if (selectedFactory) {
      const filtered = (jackpots || []).filter(
        (i) => i.factory_id === selectedFactory.id
      );
      setSelectedJackpots(filtered);
    }
  }, [selectedFactory, jackpots]);

  return (
    <Container
      minH="100vh"
      maxW="100vw"
      display="flex"
      justifyContent="center"
      alignItems={"flex-start"}
      p="15px"
      pt={["100px", "100px", "120px"]}
    >
      <Header />
      <InfoOverlay open={openInfo} onClose={onCloseInfo} />
      <VStack w="full">
        <VStack gap="20px" w={["100%", "100%", "800px"]}>
          <HStack w="full" justify="space-between">
            <MenuRoot>
              <MenuTrigger asChild>
                <Button visual="transparent" gap="8px" fontSize="18px">
                  <TrophyIcon />
                  {selectedFactory?.name}
                  <CaretIcon />
                </Button>
              </MenuTrigger>
              <MenuContent>
                {jackpotFactories?.map((factory, idx) => {
                  return (
                    <MenuItem
                      key={idx}
                      value={factory.id.toString()}
                      onClick={() => setSelectedFactory(factory)}
                    >
                      {factory.name}
                    </MenuItem>
                  );
                })}
              </MenuContent>
            </MenuRoot>
            <HStack>
              <Button visual="transparent" p="8px" onClick={() => onOpenInfo()}>
                <InfoIcon />
              </Button>
            </HStack>
          </HStack>

          <Box
            w="full"
            layerStyle="transparent"
            padding={["10px", "10px", "30px"]}
            bgColor="rgba(0,0,0,0.04)"
          >
            <HStack
              w="full"
              px={["0", "0", "20px"]}
              justify="space-between"
              fontSize="14px"
              fontWeight="450"
              color="purple.50"
              textTransform="uppercase"
            >
              <Box w="full">ID</Box>
              <Box minW="100px" textAlign="center">
                Best Score
              </Box>
              <Box w="full" textAlign="center">
                Winner(s)
              </Box>
              <Box minW="150px" textAlign="right">
                Rewards to share
              </Box>
            </HStack>
            <Spacer minH="20px" />

            <ScrollArea.Root maxH="calc(100vh - 440px)" w="full">
              <ScrollArea.Viewport>
                <ScrollArea.Content paddingEnd="6">
                  <VStack w="full" gap={6}>
                    {selectedFactory &&
                      selectedJackpots
                      .sort((a,b)=> Number(b.id) - Number(a.id))
                      .slice(0, 10).map((jackpot, idx) => {
                        const winners = getWinnersById(jackpot?.id)?.map(
                          (winner) => {
                            const controller = findController(winner.player);
                            const name = controller
                              ? controller.username
                              : shortAddress(winner.player);
                            const isOwn =
                              BigInt(winner.player) ===
                              BigInt(account?.address || 0);
                            return {
                              ...winner,
                              name,
                              isOwn,
                            };
                          }
                        );

                        let tokenBalance = 0n;

                        if (jackpot?.token.isSome()) {
                          const token = jackpot.token.unwrap();
                          switch (
                            (token.ty as CairoCustomEnum).activeVariant()
                          ) {
                            case "ERC20":
                              const values = (token.ty as CairoCustomEnum)
                                .variant["ERC20"] as TokenTypeERC20;
                              tokenBalance = BigInt(values.amount) / 10n ** 18n;
                              break;
                            default:
                              break;
                          }
                        }

                        return (
                          <HStack key={idx} w="full" alignItems="flex-start">
                            <Box w="full">
                              {selectedFactory.name} #{jackpot.id.toString()}
                            </Box>
                            <Box minW="100px" textAlign="center">
                              {jackpot.best_score.toString()}
                            </Box>
                            <Box w="full">
                              <VStack gap="0">
                                <>
                                  {winners?.map((winner, idx) => {
                                    return (
                                      <HStack key={idx}>
                                        {winner.name}{" "}
                                        {winner.isOwn && (
                                          <LuCrown
                                            color={
                                              winner.claimed ? "orange" : "gold"
                                            }
                                            cursor="pointer"
                                            onClick={() => claim(jackpot.id)}
                                          />
                                        )}
                                      </HStack>
                                    );
                                  })}
                                  {!winners ||
                                    (winners.length === 0 && (
                                      <div>[YOUR NAME HERE]</div>
                                    ))}
                                </>
                              </VStack>
                            </Box>
                            <Box minW="150px" justifyItems="flex-end">
                              <VStack alignItems="flex-end">
                                <TokenBalanceUi
                                  balance={
                                    BigInt(jackpot.nums_balance) / 10n ** 18n
                                  }
                                  address={numsAddress}
                                />
                                {tokenBalance > 0 && (
                                  <TokenBalanceUi
                                    balance={BigInt(tokenBalance)}
                                    address={jackpot.token.unwrap().address}
                                  />
                                )}
                              </VStack>
                            </Box>
                          </HStack>
                        );
                      })}
                  </VStack>
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar>
                <ScrollArea.Thumb />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner />
            </ScrollArea.Root>
          </Box>

          <HStack w="full" justifyContent="center" gap={6}>
            <Button onClick={() => navigate("/factories")}>Play Nums</Button>
            <MintNums />
          </HStack>
        </VStack>
      </VStack>

      <Footer />
    </Container>
  );
};

export default Home;
