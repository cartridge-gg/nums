import { HomeScene, LoadingScene } from "@/components/scenes";
import { useCallback, useEffect, useState } from "react";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useHeader } from "@/hooks/header";
import { usePractice } from "@/context/practice";
import { useAccount } from "@starknet-react/core";

export const Home = () => {
  const navigate = usePreserveSearchNavigate();
  const { account } = useAccount();
  const { supply: currentSupply, handleConnect } = useHeader();
  const { clearGame, start: startPractice } = usePractice();
  const [defaultLoading, setDefaultLoading] = useState(true);

  const isConnected = !!account?.address;

  const handlePracticeClick = useCallback(() => {
    if (currentSupply !== undefined && currentSupply > 0n) {
      clearGame();
      startPractice(currentSupply);
    }
    navigate("/practice");
  }, [navigate, clearGame, startPractice, currentSupply]);

  useEffect(() => {
    setTimeout(() => {
      setDefaultLoading(false);
    }, 3000);
  }, []);

  if (defaultLoading) return <LoadingScene />;

  return (
    <HomeScene
      className="md:p-16"
      isConnected={isConnected}
      onConnect={handleConnect}
      onPractice={handlePracticeClick}
    />
  );
};
