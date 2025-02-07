import { HStack, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export const Timer = ({
  expiration,
}: {
  expiration: number | undefined | null;
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiration) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = expiration - Math.floor(Date.now() / 1000);
      setTimeLeft(difference > 0 ? difference : 0);
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiration]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <HStack
      w="full"
      fontFamily="Ekamai"
      justify={["space-between", "space-between", "flex-start"]}
    >
      <HStack
        layerStyle="transparent"
        paddingY="8px"
        bgColor="rgba(0, 0, 0, 0.04)"
        flex={1}
      >
        <Text fontSize="24px" textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)">
          {hrs.toString().padStart(2, "0")}
        </Text>
        <Text color="purple.50">HRS</Text>
      </HStack>
      <HStack
        layerStyle="transparent"
        paddingY="8px"
        bgColor="rgba(0, 0, 0, 0.04)"
        flex={1}
      >
        <Text fontSize="24px" textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)">
          {mins.toString().padStart(2, "0")}
        </Text>
        <Text color="purple.50">MINS</Text>
      </HStack>
      <HStack
        layerStyle="transparent"
        paddingY="8px"
        bgColor="rgba(0, 0, 0, 0.04)"
        flex={1}
      >
        <Text fontSize="24px" textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)">
          {secs.toString().padStart(2, "0")}
        </Text>
        <Text color="purple.50">SECS</Text>
      </HStack>
    </HStack>
  );
};
