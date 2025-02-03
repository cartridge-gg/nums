import { Link } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { formatAddress } from "../utils";
import { useExplorer } from "@starknet-react/core";

const useToast = () => {
  const explorer = useExplorer();

  const showTxn = (hash: string, chainName: string) => {
    toaster.create({
      title: "Transaction Submitted on " + chainName,
      description: (
        <Link href={explorer.transaction(hash)}>
          <strong>{formatAddress(hash)}</strong>
        </Link>
      ),
    });
  };

  const showChainSwitch = (chainName: string) => {
    toaster.create({
      title: "Switched to " + chainName,
    });
  };

  const showError = (hash: string) => {
    toaster.create({
      title: "Transaction Error",
      description: (
        <Link href={explorer.transaction(hash)}>
          <strong>{formatAddress(hash)}</strong>
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
