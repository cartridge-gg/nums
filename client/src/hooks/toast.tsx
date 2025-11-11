import { LuCopy } from "react-icons/lu";
import { toast } from "sonner";
import { StarknetColoredIcon } from "@/components/icons";

const useToast = () => {
  const chainIcon = (chainName: string) => {
    return chainName === "Starknet Mainnet" ? (
      <StarknetColoredIcon />
    ) : (
      <img
        className="w-6 h-6 rounded-full object-cover"
        src="/logo.png"
        alt="Chain"
      />
    );
  };

  const showTxn = (_: string, chainName: string) => {
    toast(
      <div className="flex items-center gap-2 w-full">
        {chainIcon(chainName)}
        <span>Transaction Submitted on {chainName}</span>
      </div>,
    );
  };

  const showChainSwitch = (chainName: string) => {
    toast(
      <div className="flex items-center gap-2">
        {chainIcon(chainName)}
        <span>Switched to {chainName}</span>
      </div>,
    );
  };

  const showError = (_hash?: string, message?: string) => {
    toast.error(
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between w-full text-xl text-red-500">
          <span>Error</span>
          <LuCopy
            className="cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(message || "Error");
            }}
          />
        </div>
        <p className="text-xs break-all">{message}</p>
      </div>,
    );
  };

  const showMessage = (title: string, message?: string) => {
    toast(
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xl">{title}</span>
        {message && <p className="text-xs break-all">{message}</p>}
      </div>,
    );
  };

  const showJackpotEvent = (
    title: string,
    description: string,
    color = "purple-300",
  ) => {
    toast(
      <div className="flex flex-col gap-0">
        <span className={`text-xl text-${color}`}>{title}</span>
        <p className="text-sm">{description}</p>
      </div>,
    );
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
