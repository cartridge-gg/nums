import { Text, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import { Button } from "./Button";
import { Toaster } from "./ui/toaster";
import RewardsOverlay from "./Rewards";
import { useTotals } from "@/context/totals";
import { GiftIcon } from "./icons/Gift";

const Balance = () => {
  const { rewardsEarned, rewardsClaimed } = useTotals();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const claimable = rewardsEarned - rewardsClaimed;

  const {
    open: openRewards,
    onOpen: onOpenRewards,
    onClose: onCloseRewards,
  } = useDisclosure();

  return (
    <>
      <Toaster />
      <RewardsOverlay open={openRewards} onClose={onCloseRewards} />
      <Button
        position="relative"
        visual="transparent"
        display={rewardsEarned === 0 ? "none" : "flex"}
        h="48px"
        w={["48px", "48px", "auto"]}
        bgColor={claimable > 0 ? "green.50" : ""}
        _hover={{
          bgColor: claimable > 0 ? "green.100" : "",
        }}
        onClick={() => onOpenRewards()}
      >
        {isMobile ? (
          <GiftIcon />
        ) : (
          <Text>{rewardsEarned.toLocaleString()} NUMS</Text>
        )}
      </Button>
    </>
  );
};

export default Balance;
