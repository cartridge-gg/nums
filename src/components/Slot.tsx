import { GridItem, HStack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Button } from "./Button";

const Slot = ({
  index,
  number,
  nextNumber,
  isOwner,
  disable,
  legal,
  onClick,
}: {
  index: number;
  number: number;
  nextNumber?: number | null;
  disable: boolean;
  isOwner: boolean;
  legal: boolean;
  onClick: (
    slot: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<boolean>;
}) => {
  const [loading, setLoading] = useState(false);
  const [requestedNumber, setRequestedNumber] = useState<number | null>(null);
  const color = () => {
    if (number || (requestedNumber && number !== requestedNumber)) {
      return "green.50";
    }

    if ((disable && !number) || !legal) {
      return "purple.50";
    }

    return "white";
  };

  const numberShown = () => {
    if (requestedNumber) {
      return requestedNumber;
    }

    if (number) {
      return number;
    }

    if (isOwner) {
      return "Set";
    }

    return "-";
  };

  useEffect(() => {
    if (number === 0) {
      setRequestedNumber(null);
    }
  }, [number]);

  return (
    <GridItem>
      <HStack>
        <Text w="24px" fontWeight="500" color="purple.50">
          {index + 1}.
        </Text>
        <Button
          w={["80px", "90px", "100px"]}
          h={["calc((100dvh - 300px) / 10)", "40px", "50px"]}
          fontSize={["22px", "22px", "24px"]}
          visual="transparent"
          justifyContent="center"
          color={color()}
          disabled={!isOwner || loading || !!number || disable || !legal}
          _hover={{
            color: "orange.50",
          }}
          onClick={async (event) => {
            setLoading(true);
            if (nextNumber) {
              setRequestedNumber(nextNumber);
            }

            const result = await onClick(index, event);
            if (!result) {
              setRequestedNumber(null);
            }
            setLoading(false);
          }}
        >
          {numberShown()}
        </Button>
      </HStack>
    </GridItem>
  );
};

export default Slot;
