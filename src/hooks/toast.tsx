import { HStack, Image, Link, Spacer } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useExplorer } from "@starknet-react/core";
import { StarknetColoredIcon } from "@/components/icons/StarknetColored";
import { ExternalIcon } from "@/components/icons/External";

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

  const showTxn = (hash: string, chainName: string) => {
    toaster.create({
      title: (
        <HStack w="full">
          {chainIcon(chainName)} Transaction Submitted on {chainName} <Spacer />
          <Link
            href={explorer.transaction(hash)}
            color="rgba(255,255,255,0.48)"
          >
            <ExternalIcon />
          </Link>
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

  const showError = (hash: string) => {
    toaster.create({
      title: "Transaction Error",
      description: (
        <Link href={explorer.transaction(hash)}>
          <strong>{hash}</strong>
        </Link>
      ),
    });
  };

  return {
    showChainSwitch,
    showTxn,
    showError,
  };
};

export default useToast;
