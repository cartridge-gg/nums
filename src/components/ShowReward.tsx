import { REWARDS } from "@/constants";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";

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

export const ShowReward = ({
  level,
  x,
  y,
}: {
  level: number;
  x: number;
  y: number;
}) => {
  const [displayReward, setDisplayReward] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (level > 0) {
      const reward = REWARDS[level - 1].reward;
      setDisplayReward(reward);
      setKey((prev) => prev + 1);
    }
  }, [level]);

  return (
    <Box
      key={key}
      position="fixed"
      top={y}
      left={x}
      transform="translate(-50%, -50%)"
      animation={displayReward > 0 ? `${floatUp} 3s forwards` : "none"}
      opacity={displayReward > 0 ? 1 : 0}
      pointerEvents="none"
    >
      <Text
        color="green.50"
        fontSize="24px"
        textStyle="h-sm"
        textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)"
      >
        +{displayReward.toLocaleString()} NUMS
      </Text>
    </Box>
  );
};
