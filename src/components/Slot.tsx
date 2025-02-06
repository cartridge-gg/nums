import { GridItem, HStack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Button } from "./Button";

const Slot = ({
  index,
  number,
  nextNumber,
  isOwner,
  disable,
  onClick,
}: {
  index: number;
  number: number;
  nextNumber?: number | null;
  disable: boolean;
  isOwner: boolean;
  onClick: (slot: number) => Promise<boolean>;
}) => {
  const [loading, setLoading] = useState(false);
  const [requestedNumber, setRequestedNumber] = useState<number | null>(null);
  const color = useMemo(() => {
    if ((requestedNumber && number !== requestedNumber) || number) {
      return "green.50";
    }

    if (disable && !number) {
      return "purple.50";
    }

    return "white";
  }, [requestedNumber, disable, number]);

  const numberShown = useMemo(() => {
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
  }, [requestedNumber, number, isOwner]);
  return (
    <GridItem>
      <HStack>
        <Text w="24px" fontWeight="500" color="purple.50">
          {index + 1}.
        </Text>
        <Button
          w={["80px", "80px", "100px"]}
          h={["40px", "40px", "50px"]}
          fontSize={["22px", "22px", "24px"]}
          visual="transparent"
          justifyContent="center"
          color={color}
          disabled={!isOwner || loading || !!number || disable}
          _hover={{
            color: "orange.50",
          }}
          onClick={async () => {
            setLoading(true);
            if (nextNumber) {
              setRequestedNumber(nextNumber);
            }

            const result = await onClick(index);
            if (!result) {
              setRequestedNumber(null);
            }
            setLoading(false);
          }}
        >
          {numberShown}
        </Button>
      </HStack>
    </GridItem>
  );
};

export default Slot;
