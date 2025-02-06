import {
  Box,
  HStack,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import Overlay from "./Overlay";
import { useAccount } from "@starknet-react/core";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { AllowArray, Call, CallData } from "starknet";
import useChain from "@/hooks/chain";
import useToast from "@/hooks/toast";
import { StarknetColoredIcon } from "./icons/StarknetColored";
import { ClaimData, useClaims } from "@/hooks/claims";
import { InfoIcon } from "./icons/Info";
import { Tooltip } from "@/components/ui/tooltip";

const RewardsOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [bridging, setBridging] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const { requestAppchain, requestStarknet } = useChain();
  const { showTxn } = useToast();
  const { address, account } = useAccount();

  const {
    claims,
    amountToBridge,
    amountBridging,
    amountClaimed,
    amountToClaim,
    setAutoRefresh,
  } = useClaims();

  useEffect(() => {
    setAutoRefresh(open);
  }, [open, setAutoRefresh]);

  const claimAll = useCallback(async () => {
    if (!account || !Object.keys(claims).length) return;
    setClaiming(true);
    try {
      const txns: AllowArray<Call> = Object.entries(claims)
        .filter(([_, claim]) => claim.status === "Ready to Claim")
        .map(([_, claim]) => ({
          contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
          entrypoint: "consume_claim_reward",
          calldata: CallData.compile({
            player: account.address,
            claim_id: claim.claimId,
            amount: claim.amount,
          }),
        }));

      await requestStarknet();
      const { transaction_hash } = await account.execute(txns);
      showTxn(transaction_hash, "Starknet Mainnet");
    } catch (e) {
      console.error(e);
      setClaiming(false);
    }
  }, [claims]);

  const bridgeRewards = useCallback(async () => {
    if (!account) return;

    setBridging(true);
    try {
      const { transaction_hash } = await account.execute([
        {
          contractAddress: import.meta.env.VITE_CLAIM_CONTRACT,
          entrypoint: "claim_reward",
          calldata: [],
        },
      ]);
      showTxn(transaction_hash, "Nums Chain");
    } catch (e) {
      console.error(e);
      setBridging(false);
    }
  }, [account]);

  if (!address) return <></>;

  return (
    <Overlay
      open={open}
      onClose={() => {
        requestAppchain();
        setBridging(false);
        setClaiming(false);
        onClose();
      }}
    >
      <VStack
        w={["100%", "100%", "60%"]}
        h="full"
        align="flex-start"
        p="24px"
        pt={["80px", "80px", "60px"]}
      >
        <SimpleGrid w="full" columns={[2, 2, 4]} gap="20px">
          <Step
            title="Ready to Bridge"
            body={
              <VStack>
                <HStack>
                  {amountToBridge ? (
                    <>
                      <Image
                        boxSize="24px"
                        borderRadius="full"
                        fit="cover"
                        src="/nums_logo.png"
                      />
                      <Text fontSize="16px" fontWeight="500">
                        {amountToBridge.toLocaleString() + " NUMS"}
                      </Text>
                    </>
                  ) : (
                    <Text
                      fontSize="16px"
                      fontWeight="500"
                      color="rgba(255,255,255,0.5)"
                    >
                      None
                    </Text>
                  )}
                </HStack>
              </VStack>
            }
            footer={
              <Button
                visual="secondary"
                h="40px"
                w="full"
                fontSize="16px"
                disabled={bridging || amountToBridge === 0}
                bgColor="purple.100"
                _hover={{ bgColor: "purple.50" }}
                onClick={async () => {
                  await requestAppchain();
                  bridgeRewards();
                }}
              >
                Bridge
              </Button>
            }
          />

          <Step
            title="Bridging"
            body={
              <VStack>
                <HStack>
                  {amountBridging > 0 ? (
                    <>
                      <Spinner />
                      <Text fontSize="16px" fontWeight="500">
                        {amountBridging.toLocaleString() + " NUMS"}
                      </Text>
                    </>
                  ) : (
                    <Text
                      fontSize="16px"
                      fontWeight="500"
                      color="rgba(255,255,255,0.5)"
                    >
                      None
                    </Text>
                  )}
                </HStack>
              </VStack>
            }
            footer={
              <Box h="40px" w="full">
                {amountBridging > 0 && (
                  <Tooltip content="We're working towards real-time proving which will make bridging close to instant">
                    <HStack
                      h="40px"
                      w="full"
                      justify="center"
                      gap="4px"
                      textStyle="h-sm"
                      fontSize="24px"
                      color="rgba(255,255,255,0.5)"
                      cursor="pointer"
                    >
                      <Text>~2 HR</Text> <InfoIcon />{" "}
                    </HStack>
                  </Tooltip>
                )}
              </Box>
            }
          />

          <Step
            title="Ready to Claim"
            body={
              <VStack>
                <HStack>
                  {amountToClaim > 0 ? (
                    <>
                      <Image
                        boxSize="24px"
                        borderRadius="full"
                        fit="cover"
                        src="/nums_icon_green.png"
                      />
                      <Text fontSize="16px" fontWeight="500">
                        {amountToClaim.toLocaleString() + " NUMS"}
                      </Text>
                    </>
                  ) : (
                    <Text
                      fontSize="16px"
                      fontWeight="500"
                      color="rgba(255,255,255,0.5)"
                    >
                      None
                    </Text>
                  )}
                </HStack>
              </VStack>
            }
            footer={
              <Button
                visual="secondary"
                h="40px"
                w="full"
                fontSize="16px"
                disabled={amountToClaim === 0 || claiming}
                onClick={claimAll}
              >
                Claim
              </Button>
            }
          />

          <Step
            title="Claimed"
            body={
              <VStack>
                <HStack>
                  {amountClaimed > 0 ? (
                    <>
                      <Image
                        boxSize="24px"
                        borderRadius="full"
                        fit="cover"
                        src="/nums_icon_gray.png"
                      />
                      <Text fontSize="16px" fontWeight="500">
                        {amountClaimed.toLocaleString() + " NUMS"}
                      </Text>
                    </>
                  ) : (
                    <Text
                      fontSize="16px"
                      fontWeight="500"
                      color="rgba(255,255,255,0.5)"
                    >
                      None
                    </Text>
                  )}
                </HStack>
              </VStack>
            }
            footer={
              <Button
                h="40px"
                w="full"
                fontSize="16px"
                visual="transparent"
                textAlign="center"
                onClick={() => {
                  window.open("https://app.ekubo.org", "_blank");
                }}
              >
                <StarknetColoredIcon /> Trade
              </Button>
            }
          />
        </SimpleGrid>
        <HStack
          p="16px"
          justify="space-between"
          w="full"
          opacity={0.5}
          fontSize="14px"
          fontWeight="450"
        >
          <Text flex="1" textAlign="center">
            CLAIM ID
          </Text>
          <Text flex="1" textAlign="center">
            AMOUNT
          </Text>
          <Text flex="1" textAlign="center">
            STATUS
          </Text>
          <Text flex="1" textAlign="center">
            ETA
          </Text>
        </HStack>
        {Object.values(claims).map((claim) => (
          <Row key={claim.claimId} {...claim} />
        ))}
      </VStack>
    </Overlay>
  );
};

const Step = ({
  title,
  body,
  footer,
}: {
  title: string;
  body: ReactNode;
  footer: ReactNode;
}) => {
  return (
    <VStack flex={1} gap="2px">
      <VStack
        w="full"
        layerStyle="faded"
        align="flex-start"
        justify="center"
        borderRadius="8px 8px 0 0"
        p="20px"
      >
        <Text fontSize="14px" fontWeight="450" opacity={0.5}>
          {title}
        </Text>
        {body}
      </VStack>
      <HStack
        w="full"
        layerStyle="faded"
        align="center"
        justify="flex-start"
        borderRadius="0 0 8px 8px"
      >
        {footer}
      </HStack>
    </VStack>
  );
};

const Row = ({ claimId, amount, status, blockTimestamp }: ClaimData) => {
  const getETA = (timestamp: number) => {
    if (status === "Claimed" || status === "Ready to Claim") return "-";

    const etaTime = (timestamp + 2 * 60 * 60) * 1000; // Add 2 hours in milliseconds
    const now = Date.now();
    const minutesRemaining = (etaTime - now) / (1000 * 60);

    if (minutesRemaining <= 0) return "Unknown";
    if (minutesRemaining > 60) return `${Math.ceil(minutesRemaining / 60)}hr`;
    return `${Math.ceil(minutesRemaining)}min`;
  };

  const getStatusColor = (status: string) => {
    if (status === "Claimed") return "rgba(255,255,255,0.5)";
    if (status === "Ready to Claim") return "green.50";
    return "white";
  };

  return (
    <HStack
      borderRadius="8px"
      bgColor="rgba(255,255,255,0.04)"
      p="16px"
      justify="space-between"
      w="full"
      fontSize="16px"
      fontWeight="500"
      color={getStatusColor(status)}
    >
      <Text flex="1" textAlign="center">
        {claimId}
      </Text>
      <Text flex="1" textAlign="center">
        {amount.toLocaleString()} NUMS
      </Text>
      <Text flex="1" textAlign="center">
        {status}
      </Text>
      <Text flex="1" textAlign="center">
        {getETA(blockTimestamp)}
      </Text>
    </HStack>
  );
};

export default RewardsOverlay;
