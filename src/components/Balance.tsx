import { Box, Text, useDisclosure, HStack } from "@chakra-ui/react";
import { Button } from "./Button";
import { useEffect, useState } from "react";
import { keyframes } from "@emotion/react";
import { Toaster } from "./ui/toaster";
import RewardsOverlay from "./Rewards";
import { LogoIcon } from "./icons/Logo";
import { useTotals } from "@/context/totals";

const floatUp = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px);
  }
`;

const Balance = () => {
  const { rewardsEarned, rewardsClaimed } = useTotals();
  const [currentRewards, setCurrentRewards] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);

  const claimable = rewardsEarned - rewardsClaimed;

  const {
    open: openRewards,
    onOpen: onOpenRewards,
    onClose: onCloseRewards,
  } = useDisclosure();

  useEffect(() => {
    if (currentRewards === 0) {
      setCurrentRewards(rewardsEarned);
      return;
    }

    setCurrentRewards(rewardsEarned);
    setDifference(rewardsEarned - currentRewards);
  }, [rewardsEarned]);

  return (
    <>
      <Toaster />
      <RewardsOverlay open={openRewards} onClose={onCloseRewards} />
      <Button
        position="relative"
        visual="transparent"
        h="48px"
        bgColor={claimable > 0 ? "green.50" : ""}
        _hover={{
          bgColor: claimable > 0 ? "green.100" : "",
        }}
        onClick={() => onOpenRewards()}
      >
        <LogoIcon w={32} h={32} />
        <HStack
          display={rewardsEarned === 0 ? "none" : ["none", "none", "flex"]}
        >
          <Text>:</Text>
          <Text>{rewardsEarned.toLocaleString()} NUMS</Text>
          <Box
            position="absolute"
            bottom="-50px"
            left="50%"
            transform="translateX(-50%)"
            animation={difference > 0 ? `${floatUp} 3s forwards` : "none"}
            key={difference}
            opacity={difference > 0 ? 1 : 0}
            onAnimationEnd={() => setDifference(0)}
          >
            <Text color="green.50" fontSize="24px">
              +{difference.toLocaleString()} NUMS
            </Text>
          </Box>
        </HStack>
      </Button>
    </>
  );
};

export default Balance;
