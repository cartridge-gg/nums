import { HStack, Image, Link, Spacer, VStack } from "@chakra-ui/react";
import { jackpotToaster, toaster } from "@/components/ui/toaster";
import { useExplorer } from "@starknet-react/core";
import { StarknetColoredIcon } from "@/components/icons/StarknetColored";

const useToast = () => {
  const explorer = useExplorer();

  const chainIcon = (chainName: string) => {
    return chainName === "Starknet Mainnet" ? (
      <StarknetColoredIcon />
    ) : (
      <Image
        boxSize="24px"
        borderRadius="full"
        fit="cover"
        src="/nums_logo.png"
      />
    );
  };

  const showTxn = (_: string, chainName: string) => {
    toaster.create({
      title: (
        <HStack w="full">
          {chainIcon(chainName)} Transaction Submitted on {chainName} <Spacer />
          {/* <Link
            href={explorer.transaction(hash)}
            color="rgba(255,255,255,0.48)"
          >
            <ExternalIcon />
          </Link> */}
        </HStack>
      ),
    });
  };

  const showChainSwitch = (chainName: string) => {
    toaster.create({
      title: (
        <>
          <HStack>
            {chainIcon(chainName)} Switched to {chainName}
          </HStack>
        </>
      ),
    });
  };

  const showError = (_hash?: string, message?: string) => {
    toaster.create({
      title: "Error",
      description: message,
    });
  };

  const showMessage = (message: string) => {
    toaster.create({
      title: message,
    });
  };

  const showJackpotEvent = (
    title: string,
    description: string,
    color = "purple.50"
  ) => {
    jackpotToaster.create({
      description: (
        <VStack gap={0} alignItems="flex-start">
          <HStack textStyle="h-sm" fontSize="20px" color={color}>
            {title}
          </HStack>
          <HStack fontSize="14px">{description}</HStack>
        </VStack>
      ),
    });
  };

  return {
    showChainSwitch,
    showTxn,
    showError,
    showMessage,
    showJackpotEvent,
  };
};

export default useToast;
