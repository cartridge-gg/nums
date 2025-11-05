import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addAddressPadding, num } from "starknet";
import logo from "@/assets/logo.svg";
import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import { useAudio } from "@/context/audio";
import { useTournaments } from "@/context/tournaments";
import useChain from "@/hooks/chain";
import { useClaim } from "@/hooks/useClaim";
import { useClaimableRewards } from "@/hooks/useClaimableRewards";
import { useMintNums } from "@/hooks/useMintNums";
import { useTokens } from "@/hooks/useTokens";
import { cn } from "@/lib/utils";
import { ControllerIcon } from "./icons/Controller";
import { DisconnectIcon } from "./icons/Disconnect";
import { SoundOffIcon } from "./icons/SoundOff";
import { SoundOnIcon } from "./icons/SoundOn";
import { Button } from "./ui/button";

export const Header = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full min-h-24 max-h-24 px-8 flex items-center justify-between border-b border-[rgba(0,0,0,0.24)] bg-[linear-gradient(0deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.16)_100%)]">
      <div
        className="flex items-center justify-start gap-2 cursor-pointer select-none"
        onClick={handleClick}
      >
        <img
          src={logo}
          alt="Logo"
          className="h-12 drop-shadow-[3px_3px_0px_rgba(0,0,0,0.25)]"
          draggable={false}
        />
        <h1
          className="text-[64px] leading-[48px] uppercase text-white translate-y-1"
          style={{ textShadow: "3px 3px 0px rgba(0, 0, 0, 0.25)" }}
        >
          NUMS.GG
        </h1>
      </div>
      <div className="flex items-center justify-start gap-4">
        <Sound />
        {address && <Balance />}
        {address && <Claim />}
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
      variant="muted"
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
      accountAddresses: account?.address
        ? [addAddressPadding(account.address)]
        : [],
      contractAddresses: [addAddressPadding(num.toHex64(numsAddress))],
    },
    true,
  );

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
        "h-12 px-4 py-2 text-2xl tracking-wide",
        !isMainnet ? "cursor-pointer" : "cursor-default",
      )}
      onClick={() => {
        if (isMainnet) return;
        mintMockNums();
      }}
    >
      <p
        className="translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >{`${balance.toLocaleString()} NUMS`}</p>
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
      className="h-12 px-4 py-2 font-[PixelGame] tracking-wide flex items-center justify-center gap-2 [&_svg]:size-6"
      onClick={async () => {
        (connector as ControllerConnector)?.controller.openProfile(
          "inventory",
        );
      }}
    >
      {address && <ControllerIcon />}
      <p
        className="translate-y-0.5 text-2xl"
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
      className="h-12 px-4 py-2 font-[PixelGame] tracking-wide text-2xl"
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
      className="h-12 px-4 py-2 [&_svg]:size-8"
      onClick={() => disconnect()}
    >
      <DisconnectIcon />
    </Button>
  );
};

export const ClaimIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_987_2695)">
        <path
          d="M9.95312 6.15L11.0406 8H11H8.75C8.05937 8 7.5 7.44062 7.5 6.75C7.5 6.05938 8.05937 5.5 8.75 5.5H8.81875C9.28437 5.5 9.71875 5.74688 9.95312 6.15ZM6 6.75C6 7.2 6.10938 7.625 6.3 8H5C4.44687 8 4 8.44688 4 9V11C4 11.5531 4.44687 12 5 12H19C19.5531 12 20 11.5531 20 11V9C20 8.44688 19.5531 8 19 8H17.7C17.8906 7.625 18 7.2 18 6.75C18 5.23125 16.7688 4 15.25 4H15.1812C14.1844 4 13.2594 4.52813 12.7531 5.3875L12 6.67188L11.2469 5.39062C10.7406 4.52812 9.81562 4 8.81875 4H8.75C7.23125 4 6 5.23125 6 6.75ZM16.5 6.75C16.5 7.44062 15.9406 8 15.25 8H13H12.9594L14.0469 6.15C14.2844 5.74688 14.7156 5.5 15.1812 5.5H15.25C15.9406 5.5 16.5 6.05938 16.5 6.75ZM5 13V18.5C5 19.3281 5.67188 20 6.5 20H11V13H5ZM13 20H17.5C18.3281 20 19 19.3281 19 18.5V13H13V20Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_987_2695"
          x="4"
          y="4"
          width="18"
          height="18"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.95 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_987_2695"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_987_2695"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const Claim = () => {
  const { claim } = useClaim();
  const { tournaments } = useTournaments();
  const { claimableRewards, loading } = useClaimableRewards();

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

  const handleClaim = async () => {
    if (claims.length === 0) return;

    const claimsToMake = claims.map((reward) => ({
      tournamentId: reward.tournamentId,
      tokenAddress: reward.tokenAddress,
      gameId: reward.gameId,
      position: reward.position,
    }));

    await claim(claimsToMake);
  };

  // Don't show the button if there are no claimable rewards
  if (!loading && claims.length === 0) {
    return null;
  }

  return (
    <Button
      variant="muted"
      className="h-12 px-4 py-2 [&_svg]:size-6 gap-2 text-green-100"
      onClick={handleClaim}
      disabled={loading || claims.length === 0}
    >
      <ClaimIcon />
      <p
        className="text-[28px]/[19px] translate-y-[3px] tracking-wide"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 1)" }}
      >
        {loading ? "..." : `Claim ${claims.length}!`}
      </p>
    </Button>
  );
};
