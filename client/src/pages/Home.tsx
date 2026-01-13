import { useAccount, useConnect } from "@starknet-react/core";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { Header } from "@/components/layouts/header";
import { useHeader } from "@/hooks/header";

const background = "/assets/tunnel-background.svg";
import { CircleInfoIcon, CopyIcon, TrophyIcon } from "@/components/icons";
import { LogoIcon } from "@/components/icons/exotics";
import { Close, Inventory } from "@/components/inventory";
import { PrizePoolModal } from "@/components/jackpot-details";
import { Leaderboard } from "@/components/leaderboard";
import { Button } from "@/components/ui/button";
import { getNumsAddress } from "@/config";
import { useModal } from "@/context/modal";
import { useEntities } from "@/context/entities";
import useChain from "@/hooks/chain";
import { useTokenContracts } from "@/hooks/useTokenContracts";
import { cn } from "@/lib/utils";

export const Home = () => {
  const headerData = useHeader();
  const { isInventoryOpen, closeInventory } = useModal();
  const [prizePoolModal, setPrizePoolModal] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoClosing, setIsInfoClosing] = useState(false);

  const openInfo = useCallback(() => {
    setIsInfoOpen(true);
    setIsInfoClosing(false);
  }, []);

  const closeInfo = useCallback(() => {
    setIsInfoClosing(true);
  }, []);

  useEffect(() => {
    if (!isInfoClosing) return;
    const timeoutId = setTimeout(() => {
      setIsInfoOpen(false);
      setIsInfoClosing(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [isInfoClosing]);

  return (
    <div
      className="relative h-full w-screen flex flex-col overflow-hidden"
      onClick={() => {
        if (isInventoryOpen) closeInventory();
        if (prizePoolModal) setPrizePoolModal(false);
        if (isInfoOpen) closeInfo();
      }}
    >
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <Header
        isMuted={headerData.isMuted}
        onToggleMute={headerData.toggleMute}
        balance={headerData.balance}
        username={headerData.username}
        address={headerData.address}
        isMainnet={headerData.isMainnet}
        onConnect={headerData.handleConnect}
        onOpenProfile={headerData.handleOpenProfile}
        onMint={headerData.mintMockNums}
      />
      <Main
        prizePoolModal={prizePoolModal}
        setPrizePoolModal={setPrizePoolModal}
        isInfoOpen={isInfoOpen}
        openInfo={openInfo}
        closeInfo={closeInfo}
        isInfoClosing={isInfoClosing}
      />
    </div>
  );
};

export const Main = ({
  prizePoolModal,
  setPrizePoolModal,
  isInfoOpen,
  openInfo,
  closeInfo,
  isInfoClosing,
}: {
  prizePoolModal: boolean;
  setPrizePoolModal: (value: boolean) => void;
  isInfoOpen: boolean;
  openInfo: () => void;
  closeInfo: () => void;
  isInfoClosing: boolean;
}) => {
  const { config, usage } = useEntities();
  const { isInventoryOpen, openInventory, closeInventory } = useModal();

  console.log({ config, usage });

  return (
    <div className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] p-4 pb-[28px] md:px-16 md:py-12 overflow-hidden">
      {isInventoryOpen && (
        <div
          className="absolute inset-0 z-50 p-2 md:p-6"
          onClick={closeInventory}
        >
          <Inventory />
        </div>
      )}
      {isInfoOpen && (
        <div
          className="absolute inset-0 z-50 p-2 md:p-6"
          onClick={(event) => {
            event.stopPropagation();
            closeInfo();
          }}
        >
          <InfoModal close={closeInfo} isClosing={isInfoClosing} />
        </div>
      )}
      {prizePoolModal && (
        <div
          className="w-full absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/4 z-50 p-2 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <PrizePoolModal prizes={[]} setModal={setPrizePoolModal} />
        </div>
      )}
      <div className="h-full max-w-[784px] mx-auto flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Info
              onClick={(event) => {
                event.stopPropagation();
                openInfo();
              }}
            />
            <div className="hidden md:block">
              <Play onClick={openInventory} />
            </div>
          </div>
        </div>
        <div className="h-full overflow-hidden">
          <Leaderboard />
        </div>
        <div className="block md:hidden">
          <Play onClick={openInventory} />
        </div>
      </div>
    </div>
  );
};

export const Info = ({
  onClick,
}: {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <Button variant="muted" className="p-2 cursor-pointer" onClick={onClick}>
      <div className="[&_svg]:size-6 flex items-center justify-center">
        <CircleInfoIcon />
      </div>
    </Button>
  );
};

type InfoTabKey = "about" | "nums";

const tabs: Array<{
  id: InfoTabKey;
  label: string;
  icon: () => JSX.Element;
}> = [
  {
    id: "about",
    label: "About",
    icon: () => <TrophyIcon variant="solid" />,
  },
  {
    id: "nums",
    label: "Nums",
    icon: () => <LogoIcon />,
  },
];

const InfoModal = ({
  close,
  isClosing,
}: {
  close: () => void;
  isClosing: boolean;
}) => {
  const { chain } = useChain();
  const [activeTab, setActiveTab] = useState<InfoTabKey>("about");

  const { contracts } = useTokenContracts({
    contractAddresses: [addAddressPadding(getNumsAddress(chain.id))],
  });

  const tokenSupply = useMemo(() => {
    if (!contracts || contracts.length === 0) return 0;
    const contract = contracts[0];
    return Number(
      BigInt(contract.total_supply || "0x0") / 10n ** BigInt(contract.decimals),
    );
  }, [contracts]);

  return (
    <div
      className="w-full h-full select-none"
      style={{
        transform: isClosing
          ? "scaleY(0.005) scaleX(0)"
          : "scaleY(1) scaleX(1)",
        animation: isClosing
          ? "unfoldOut 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards"
          : "unfoldIn 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards",
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="relative w-full h-full rounded-2xl bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] p-6"
        style={{
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          transform: isClosing ? "scale(0)" : "scale(1)",
          animation: isClosing
            ? "zoomOut 0.5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards"
            : "zoomIn 0.5s 0.8s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards both",
        }}
      >
        <Close close={close} />
        <div className="max-w-[784px] mx-auto py-16 md:py-[120px] flex flex-col gap-12 h-full overflow-hidden">
          <div className="flex gap-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="muted"
                className={cn(
                  "h-10 px-4 py-2 flex items-center gap-0.5 uppercase tracking-wide text-[28px]/[19px] [&_svg]:size-6 bg-mauve-700 text-white-400 [&_svg]:text-white-400 transition-all duration-0",
                  activeTab === id &&
                    "bg-mauve-500 text-white-100 [&_svg]:text-white-100 cursor-default pointer-events-none",
                )}
                onClick={() => setActiveTab(id)}
              >
                <Icon />
                <span
                  className="translate-y-0.5 tracking-wider px-1"
                  style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  {label}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-left">
            <h2
              className="text-[48px]/[33px] md:text-[64px]/[42px] uppercase translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              {activeTab === "about" ? "How to play" : "Tokens details"}
            </h2>
            {activeTab === "about" ? (
              <div className="flex flex-col gap-6 text-base/5 text-white-100 font-circular">
                <p>
                  Welcome to Nums, a fully onchain game built by Cartridge using
                  the Dojo framework.
                </p>
                <p>
                  The goal is simple: place randomly generated numbers in
                  ascending order. Players compete and earn NUMS tokens by
                  placing as many numbers as possible.
                </p>
                <p>
                  Before the game starts you can select from a variety of
                  powerups to help you place more numbers. Be careful, you must
                  use them before the game ends or they will be lost.
                </p>
                <p>
                  The game ends when there is no longer a valid way to place the
                  next number in ascending order.
                </p>
                <p>The better you do the more you earn!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 text-base/5 text-white-100 font-circular">
                <p>Play NUMS to earn NUMS. Spend NUMS to play NUMS.</p>
                <TokenAddressCard />
                <div className="flex flex-col rounded border border-white-900 bg-white-900 px-5 py-4 gap-3">
                  <strong
                    className="font-pixel text-lg/3 tracking-wider text-mauve-100"
                    style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    Token supply
                  </strong>
                  <span>{tokenSupply.toLocaleString()}/∞</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TokenAddressCard = () => {
  const { chain } = useChain();
  const [copied, setCopied] = useState(false);
  const tokenAddress = useMemo(
    () => getChecksumAddress(getNumsAddress(chain.id)),
    [chain.id],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy token address", error);
    }
  }, [tokenAddress]);

  return (
    <div className="relative flex flex-col gap-2 rounded border border-white-900 bg-white-900 px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <strong
          className="font-pixel text-lg/3 tracking-wider text-mauve-100"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          NUMS Token Address
        </strong>
        <Button
          type="button"
          variant="ghost"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 [&_svg]:size-5 text-white-100 bg-transparent hover:bg-transparent"
          onClick={(event) => {
            event.stopPropagation();
            handleCopy();
          }}
          aria-label="Copy NUMS token address"
        >
          <CopyIcon />
        </Button>
      </div>
      <span className="font-mono text-sm break-all pr-6">{tokenAddress}</span>
      {copied && (
        <span className="font-pixel absolute right-3 top-1/4 md:top-3 -translate-x-1/2 text-xs text-mauve-100 tracking-wide animate-copy-pop">
          Copied!
        </span>
      )}
    </div>
  );
};

export const Play = ({ onClick }: { onClick: () => void }) => {
  const { account } = useAccount();
  const { connectAsync, connectors } = useConnect();

  const handleClick = async () => {
    if (!account) {
      connectAsync({ connector: connectors[0] }).then(() => {
        onClick();
      });
    } else {
      onClick();
    }
  };

  return (
    <Button
      variant={!account ? "muted" : "default"}
      className="h-10 w-full md:w-auto px-6 py-2 tracking-wide cursor-pointer"
      onClick={handleClick}
    >
      <p
        className="text-[28px]/[19px] translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.24)" }}
      >
        Play!
      </p>
    </Button>
  );
};
