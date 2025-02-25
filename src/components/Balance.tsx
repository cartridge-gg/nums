import {
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Button } from "./Button";
import { Toaster } from "./ui/toaster";
import RewardsOverlay from "./RewardsBridging";
import { GiftIcon } from "./icons/Gift";
import { useClaims } from "@/context/claims";
import { Tooltip, TooltipRow } from "./ui/tooltip";

const Balance = () => {
  const {
    amountToClaim,
    amountToBridge,
    amountEarned,
    amountClaimed,
    amountBridging,
  } = useClaims();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const {
    open: openRewards,
    onOpen: onOpenRewards,
    onClose: onCloseRewards,
  } = useDisclosure();

  return (
    <>
      <Toaster />
      <RewardsOverlay open={openRewards} onClose={onCloseRewards} />
      <Tooltip
        showArrow
        content={
          <>
            <VStack p="10px" align="flex-start">
              <TooltipRow
                label="Ready to Claim"
                value={amountToClaim}
                unit="NUMS"
              />
              <TooltipRow
                label="Ready to Bridge"
                value={amountToBridge}
                unit="NUMS"
              />
              <TooltipRow label="Bridging" value={amountBridging} unit="NUMS" />
              <TooltipRow
                label="Starknet Balance"
                value={amountClaimed}
                unit="NUMS"
              />
            </VStack>
          </>
        }
      >
        <Button
          position="relative"
          visual="transparent"
          display={amountEarned === 0 ? "none" : "flex"}
          h="48px"
          w={["48px", "48px", "auto"]}
          bgColor={amountToClaim > 0 ? "green.50" : ""}
          _hover={{
            bgColor: amountToClaim > 0 ? "green.100" : "",
          }}
          onClick={() => onOpenRewards()}
        >
          {isMobile ? (
            <GiftIcon />
          ) : (
            <Text>{amountEarned.toLocaleString()} NUMS</Text>
          )}
        </Button>
      </Tooltip>
    </>
  );
};

export default Balance;
