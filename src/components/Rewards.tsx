import { Text } from "@chakra-ui/react";
import Overlay from "./Overlay";
import { useAccount } from "@starknet-react/core";

const RewardsOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { address } = useAccount();

  if (!address) return <></>;

  return (
    <Overlay open={open} onClose={onClose}>
      <Text textStyle="h-md">Rewards</Text>
    </Overlay>
  );
};

export default RewardsOverlay;
