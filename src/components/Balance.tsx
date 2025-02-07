import { Text, useDisclosure } from "@chakra-ui/react";
import { Button } from "./Button";
import { Toaster } from "./ui/toaster";
import RewardsOverlay from "./Rewards";
import { useTotals } from "@/context/totals";

const Balance = () => {
  const { rewardsEarned, rewardsClaimed } = useTotals();

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
        bgColor={claimable > 0 ? "green.50" : ""}
        _hover={{
          bgColor: claimable > 0 ? "green.100" : "",
        }}
        onClick={() => onOpenRewards()}
      >
        <Text>{rewardsEarned.toLocaleString()} NUMS</Text>
      </Button>
    </>
  );
};

export default Balance;
