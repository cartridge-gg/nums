import { HStack, VStack } from "@chakra-ui/react";
import { CloseIcon } from "./icons/Close";
import { Button } from "./Button";

const Overlay = ({
  open,
  onClose,
  children,
}: {
  open?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <HStack
      w="100vw"
      h="100vh"
      top="0"
      left="0"
      position="absolute"
      padding="125px 25px 25px 25px"
      opacity={open ? 1 : 0}
      visibility={open ? "visible" : "hidden"}
      transition="opacity 0.2s ease-in-out"
      pointerEvents="none"
      zIndex="1000"
    >
      <VStack
        w="100%"
        h="100%"
        borderRadius="24px"
        bg="rgba(0, 0, 0, 0.64)"
        border="2px solid #000000"
        boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
        backdropFilter="blur(2px)"
        justify="center"
        pointerEvents="all"
      >
        <Button
          visual="transparent"
          position="absolute"
          top="24px"
          right="24px"
          onClick={() => onClose()}
        >
          <CloseIcon />
        </Button>
        {children}
      </VStack>
    </HStack>
  );
};

export default Overlay;
