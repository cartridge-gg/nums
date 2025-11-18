import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import Sparkles from "react-sparkle";
import { useWindowSize } from "react-use";
import { addAddressPadding, num } from "starknet";
import {
  ControllerIcon,
  DisconnectIcon,
  GiftIcon,
  LogoIcon,
  LogoMiniIcon,
  SoundOffIcon,
  SoundOnIcon,
} from "@/components/icons";
import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import { useAudio } from "@/context/audio";
import { useTournaments } from "@/context/tournaments";
import useChain from "@/hooks/chain";
import { useClaim } from "@/hooks/useClaim";
import { useClaimableRewards } from "@/hooks/useClaimableRewards";
import { useMintNums } from "@/hooks/useMintNums";
import { useTokens } from "@/hooks/useTokens";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const Header = () => {
  const { chain } = useChain();
  const { address } = useAccount();
  const { width, height } = useWindowSize();
  const [run, setRun] = useState(false);
  const [recycle, setRecycle] = useState(true);
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  return (
    <div className="w-full min-h-16 md:min-h-24 max-h-24 px-3 md:px-8 flex items-center justify-between border-b border-[rgba(0,0,0,0.24)] bg-[linear-gradient(0deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.16)_100%)]">
      <Link
        to="/"
        className="flex items-center justify-start gap-2 cursor-pointer select-none [&_svg]:size-10 md:[&_svg]:size-12"
      >
        <LogoIcon
          className="drop-shadow-[3px_3px_0px_rgba(0,0,0,0.25)] text-white"
          aria-hidden="true"
        />
        <h1
          className="text-[64px] leading-[48px] uppercase text-white translate-y-1 hidden md:block"
          style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
        >
          NUMS.GG
        </h1>
      </Link>
      <div className="flex items-center justify-start gap-2 md:gap-4">
        <Sound />
        {address && isMainnet ? (
          <Link
            to="https://app.ekubo.org/starknet/?outputCurrency=NUMS&amount=-2000&inputCurrency=USDC"
            target="_blank"
          >
            <Balance />
          </Link>
        ) : (
          <Balance />
        )}
        {address && <Claim setRun={setRun} setRecycle={setRecycle} />}
        {address ? <Profile /> : <Connect />}
        {address && <Disconnect />}
      </div>
      <Confetti width={width} height={height} recycle={recycle} run={run} />
    </div>
  );
};

export const Sound = () => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <Button
      variant="muted"
      onClick={() => toggleMute()}
      className="h-10 md:h-12 w-10 md:w-auto px-2 md:px-4 py-2 [&_svg]:size-6 md:[&_svg]:size-8"
    >
      {isMuted ? <SoundOffIcon size="lg" /> : <SoundOnIcon size="lg" />}
    </Button>
  );
};

export const Balance = () => {
  const { account } = useAccount();
  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const { mintMockNums } = useMintNums();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  const { tokens, balances, getBalance, toDecimal } = useTokens({
    accountAddresses: account?.address
      ? [addAddressPadding(account.address)]
      : [],
    contractAddresses: [addAddressPadding(num.toHex64(numsAddress))],
  });

  const prevBalanceRef = useRef<bigint | undefined>(undefined);
  const balanceDiff = useRef<{ value: bigint }>({ value: 0n });

  const balance = useMemo(() => {
    if (!account) return "0";

    const token = tokens.find(
      (i) => BigInt(i.contract_address) === BigInt(numsAddress),
    );
    if (!token) return "0";

    const balance = getBalance(token);
    if (!balance) return "0";

    const balanceScaled = toDecimal(token, balance);

    const diff = balanceScaled - (prevBalanceRef.current || 0n);

    if (diff !== 0n) {
      balanceDiff.current = { value: diff };
      prevBalanceRef.current = balanceScaled;
    }

    return balanceScaled;
  }, [balances, tokens, getBalance, toDecimal, account]);

  return (
    <Button
      variant="muted"
      className={cn(
        "h-10 md:h-12 px-3 md:px-4 py-2 text-2xl tracking-wide gap-1",
      )}
      onClick={() => {
        if (isMainnet) return;
        mintMockNums();
      }}
    >
      <div className="block md:hidden [&_svg]:size-6 md:[&_svg]:size-8">
        <LogoMiniIcon />
      </div>
      <p
        className="translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        {`${Number(balance).toLocaleString()}`}
        <span className="hidden md:inline"> NUMS</span>
      </p>
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
      variant="muted"
      className="h-10 md:h-12 w-10 md:w-auto px-2 md:px-4 py-2 font-[PixelGame] tracking-wide flex items-center justify-center gap-2 [&_svg]:size-6 md:[&_svg]:size-8"
      onClick={async () => {
        (connector as ControllerConnector)?.controller.openProfile("inventory");
      }}
    >
      {address && <ControllerIcon />}
      <p
        className="translate-y-0.5 text-2xl hidden md:block"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        {username}
      </p>
    </Button>
  );
};

export const Connect = () => {
  const { connectAsync, connectors } = useConnect();
  return (
    <Button
      className="h-10 w-full md:h-12 md:w-auto px-4 py-2 font-[PixelGame] tracking-wide text-2xl"
      variant="default"
      onClick={async () => {
        await connectAsync({ connector: connectors[0] });
      }}
    >
      <p
        className="translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Connect
      </p>
    </Button>
  );
};

export const Disconnect = () => {
  const { disconnect } = useDisconnect();

  return (
    <Button
      variant="muted"
      className="h-10 md:h-12 w-10 md:w-auto px-3 md:px-4 py-2 [&_svg]:size-6 md:[&_svg]:size-8 gap-1"
      onClick={() => disconnect()}
    >
      <DisconnectIcon size="lg" />
    </Button>
  );
};

export const Claim = ({
  setRun,
  setRecycle,
}: {
  setRun: (run: boolean) => void;
  setRecycle: (recycle: boolean) => void;
}) => {
  const { claim } = useClaim();
  const { tournaments } = useTournaments();
  const { claimableRewards } = useClaimableRewards();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [render, setRender] = useState(false);

  const claims = useMemo(() => {
    if (!tournaments) return [];
    const ids = tournaments
      .filter((tournament) => tournament.hasEnded())
      .map((tournament) => tournament.id);
    return claimableRewards
      .filter((reward) => ids.includes(reward.tournamentId))
      .map((reward) => ({
        tournamentId: reward.tournamentId,
        tokenAddress: reward.tokenAddress,
        gameId: reward.gameId,
        position: reward.position,
      }));
  }, [claimableRewards, tournaments]);

  const disabled = useMemo(() => {
    return loading || claims.length === 0 || claimed;
  }, [loading, claims, claimed]);

  const handleClaim = useCallback(async () => {
    if (claims.length === 0) return;
    setLoading(true);
    setRender(true);
    const claimsToMake = claims.map((reward) => ({
      tournamentId: reward.tournamentId,
      tokenAddress: reward.tokenAddress,
      gameId: reward.gameId,
      position: reward.position,
    }));

    const success = await claim(claimsToMake);
    if (success) {
      setRun(true);
      setClaimed(true);
    }
    setTimeout(() => {
      setRecycle(false);
    }, 10000);
    setLoading(false);
  }, [claims, claim, setLoading, setRun, setRecycle, setClaimed]);

  // Don't show the button if there are no claimable rewards
  if (claims.length === 0 && !render) return null;

  return (
    <Button
      variant="secondary"
      className="relative h-10 md:h-12 w-10 md:w-auto px-2 md:px-4 py-2 [&_svg]:size-6 md:[&_svg]:size-8 gap-2 bg-pink-100 hover:bg-pink-200"
      onClick={handleClaim}
      disabled={disabled}
    >
      {!disabled && <Sparkles flicker={false} />}
      {loading ? (
        <Loader2 className="p-0.5 md:p-1 animate-spin" />
      ) : (
        <GiftIcon variant="solid" />
      )}
    </Button>
  );
};
