import { HStack, Text } from "@chakra-ui/react";

export const Timer = ({
  hrs,
  mins,
  secs,
}: {
  hrs: number;
  mins: number;
  secs: number;
}) => {
  return (
    <HStack w="full" fontFamily="Ekamai">
      <HStack
        layerStyle="transparent"
        paddingY="8px"
        bgColor="rgba(0, 0, 0, 0.04)"
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
      >
        <Text fontSize="24px" textShadow="2px 2px 0px rgba(0, 0, 0, 0.25)">
          {secs.toString().padStart(2, "0")}
        </Text>
        <Text color="purple.50">SECS</Text>
      </HStack>
    </HStack>
  );
};
