import ControllerConnector from "@cartridge/connector/controller";
import type { ControllerOptions } from "@cartridge/controller";
import { type Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  type Connector,
  jsonRpcProvider,
  StarknetConfig,
  voyager,
} from "@starknet-react/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navigate } from "@/lib/router";
import { chains, DEFAULT_CHAIN, DEFAULT_CHAIN_ID } from "@/config";
import { AudioProvider } from "./context/audio";
import { SoundProvider } from "./context/sound";
import { EntitiesProvider } from "./context/entities";
import { PracticeProvider } from "./context/practice";
import { Game, Home } from "./pages";
import { queryClient } from "./queries";
import { QuestsProvider } from "./context/quests";
import { LoadingProvider } from "./context/loading";
import { WelcomeProvider } from "./context/welcome";
import { Layout } from "./components/layouts";
import { AchievementsProvider } from "./context/achievements";
import { TutorialProvider } from "./context/tutorial";
import { GamesProvider } from "./context/games";
import { PostHogProvider } from "./context/posthog";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: MAINNET_RPC };
      case sepolia:
        return { nodeUrl: SEPOLIA_RPC };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

const MAINNET_RPC =
  import.meta.env.VITE_SN_MAIN_RPC_URL ||
  "https://api.cartridge.gg/x/starknet/mainnet";
const SEPOLIA_RPC =
  import.meta.env.VITE_SN_SEPOLIA_RPC_URL ||
  "https://api.cartridge.gg/x/starknet/sepolia";

const buildChains = () => {
  const chain = chains[DEFAULT_CHAIN_ID];
  switch (chain) {
    case mainnet:
      return [{ rpcUrl: MAINNET_RPC }];
    case sepolia:
      return [{ rpcUrl: SEPOLIA_RPC }];
    default:
      throw new Error(`Unsupported chain: ${chain.network}`);
  }
};

const toriiUrl = import.meta.env[`VITE_${DEFAULT_CHAIN}_TORII_URL`] || "";
const slot = toriiUrl.split("/").slice(-2, -1)[0];
const options: ControllerOptions = {
  defaultChainId: DEFAULT_CHAIN_ID,
  chains: buildChains(),
  preset: "nums",
  namespace: "NUMS",
  slot: slot,
};

const connectors = [new ControllerConnector(options) as never as Connector];

function App() {
  return (
    <JotaiProvider>
      <PostHogProvider>
        <QueryClientProvider client={queryClient}>
          <StarknetConfig
            autoConnect
            chains={[chains[DEFAULT_CHAIN_ID]]}
            connectors={connectors}
            explorer={voyager}
            provider={provider}
          >
            <AudioProvider>
              <EntitiesProvider>
                <GamesProvider>
                  <PracticeProvider>
                    <TutorialProvider>
                      <QuestsProvider>
                        <AchievementsProvider>
                          <WelcomeProvider>
                            <LoadingProvider>
                              <Router
                                future={{
                                  v7_startTransition: true,
                                  v7_relativeSplatPath: true,
                                }}
                              >
                                <SoundProvider>
                                  <Layout>
                                    <Routes>
                                      <Route path="/" element={<Home />} />
                                      <Route
                                        path="/game/:id"
                                        element={<Game />}
                                      />
                                      <Route
                                        path="/game"
                                        element={<Navigate to="/" replace />}
                                      />
                                      <Route
                                        path="/practice"
                                        element={<Game />}
                                      />
                                    </Routes>
                                  </Layout>
                                </SoundProvider>
                              </Router>
                            </LoadingProvider>
                          </WelcomeProvider>
                        </AchievementsProvider>
                      </QuestsProvider>
                    </TutorialProvider>
                  </PracticeProvider>
                </GamesProvider>
              </EntitiesProvider>
            </AudioProvider>
          </StarknetConfig>
        </QueryClientProvider>
      </PostHogProvider>
    </JotaiProvider>
  );
}

export default App;
