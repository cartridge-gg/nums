import { Text } from "@chakra-ui/react";
import Overlay from "./Overlay";

const RewardsOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Overlay open={open} onClose={onClose}>
      <Text textStyle="h-md">Rewards</Text>
    </Overlay>
  );
};

export default RewardsOverlay;
