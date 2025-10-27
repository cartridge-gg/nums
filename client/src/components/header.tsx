import logo from "@/assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { SoundOffIcon } from "./icons/SoundOff";
import { SoundOnIcon } from "./icons/SoundOn";
import { useAudio } from "@/context/audio";
import { useMintNums } from "@/hooks/useMintNums";
import { cn } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useTokens } from "@/hooks/useTokens";
import { addAddressPadding, num } from "starknet";
import { useEffect, useMemo, useRef, useState } from "react";
import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import useChain from "@/hooks/chain";
import { Button } from "./ui/button";
import ControllerConnector from "@cartridge/connector/controller";
import { ControllerIcon } from "./icons/Controller";
import { DisconnectIcon } from "./icons/Disconnect";

export const Header = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full min-h-24 max-h-24 px-8 flex items-center justify-between border-b border-[rgba(0,0,0,0.24)] bg-[linear-gradient(0deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.16)_100%)]">
      <div className="flex items-center justify-start gap-2 cursor-pointer select-none" onClick={handleClick}>
        <img src={logo} alt="Logo" className="h-12 drop-shadow-[3px_3px_0px_rgba(0,0,0,0.25)]" draggable={false} />
        <h1 className="text-[64px] leading-[48px] uppercase text-white translate-y-1" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>NUMS.GG</h1>
      </div>
      <div className="flex items-center justify-start gap-4">
        <Sound />
        {address && <Balance />}
        {address ? <Profile /> : <Connect />}
        {address && <Disconnect />}
      </div>
    </div>
  );
};

export const Sound = () => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <Button
      variant="secondary"
      onClick={() => toggleMute()}
      className="h-12 px-4 py-2 [&_svg]:size-8"
    >
      {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
    </Button>
  );
};

export const Balance = () => {
  const { account } = useAccount();
  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const { mintMockNums } = useMintNums();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  const { tokens, balances, getBalance, toDecimal } = useTokens(
    {
      accountAddresses: account?.address ? [addAddressPadding(account.address)] : [],
      contractAddresses: [addAddressPadding(num.toHex64(numsAddress))],
    },
    true
  );

  const prevBalanceRef = useRef<number | undefined>(undefined);
  const balanceDiff = useRef<{ value: number }>({ value: 0 });

  const balance = useMemo(() => {
    if (!account) return 0;

    const token = tokens.find(
      (i) => BigInt(i.contract_address) === BigInt(numsAddress)
    );
    if (!token) return 0;

    const balance = getBalance(token);
    if (!balance) return 0;

    const balanceScaled = toDecimal(token, balance);

    const diff = Math.round(balanceScaled - (prevBalanceRef.current || 0));

    if (diff !== 0) {
      balanceDiff.current = { value: diff };
      prevBalanceRef.current = balanceScaled;
    }

    return balanceScaled;
  }, [balances, tokens, getBalance, toDecimal, account]);

  return (
    <Button
      variant="secondary"
      className={cn("h-12 px-4 py-2 text-2xl tracking-wider", !isMainnet ? "cursor-pointer" : "cursor-default")}
      onClick={() => {
        if (isMainnet) return;
        mintMockNums();
      }}
    >
      <p className="translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 1)' }}>{`${balance.toLocaleString()} NUMS`}</p>
    </Button>
  );
};

export const Profile = () => {
  const { address, connector } = useAccount();
  const [username, setUsername] = useState<string | null>(null);

  const controllerConnector = connector as never as ControllerConnector;

  useEffect(() => {
    if (controllerConnector) {
      controllerConnector.username()?.then((username) => {
        setUsername(username);
      });
    }
  }, [controllerConnector]);
  
  return (
    <Button
      variant="secondary"
      className="h-12 px-4 py-2 font-[PixelGame] tracking-wider flex items-center justify-center gap-2 [&_svg]:size-6"
      onClick={async () => {
        (connector as ControllerConnector)?.controller.openProfile(
          "achievements"
        );
      }}
    >
      {address && <ControllerIcon />}
    <p className="translate-y-0.5 text-2xl" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 1)' }}>{username}</p>
  </Button>
  );
};

export const Connect = () => {
  const { connectAsync, connectors } = useConnect();
  return (
    <Button
    className="h-12 px-4 py-2 font-[PixelGame] tracking-wider text-2xl"
      variant="default"
      onClick={async () => {
        await connectAsync({ connector: connectors[0] });
      }}
    >
      <p className="translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.24)' }}>Connect</p>
    </Button>
  );
};

export const Disconnect = () => {
  const { disconnect } = useDisconnect();

  return (
    <Button
      variant="secondary"
      className="h-12 px-4 py-2 [&_svg]:size-8"
      onClick={() => disconnect()}
    >
      <DisconnectIcon />
    </Button>
  );
};