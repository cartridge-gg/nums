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
    if (requestedNumber && number !== requestedNumber) {
      return "orange.50";
    }

    if (disable) {
      return "purple.50";
    }

    if (number) {
      return "green.50";
    }

    return "white";
  }, [requestedNumber, disable, number]);
  return (
    <GridItem>
      <HStack>
        <Text w="24px" fontWeight="500" color="purple.50">
          {index + 1}.
        </Text>
        <Button
          w="100px"
          fontSize="24px"
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
          {requestedNumber
            ? requestedNumber
            : number
              ? number
              : isOwner
                ? "Set"
                : "-"}
        </Button>
      </HStack>
    </GridItem>
  );
};

export default Slot;
