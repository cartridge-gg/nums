import ControllerConnector from "@cartridge/connector/controller";
import type { ControllerOptions } from "@cartridge/controller";
import {
  type Connector,
  jsonRpcProvider,
  StarknetConfig,
  voyager,
} from "@starknet-react/core";
import { mainnet } from "@starknet-react/chains";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navigate } from "@/lib/router";
import { DEFAULT_CHAIN_ID, RPC_URL, TORII_URL } from "@/config";
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
  rpc: () => ({ nodeUrl: RPC_URL }),
});

const slot = TORII_URL.split("/").slice(-2, -1)[0];
const options: ControllerOptions = {
  defaultChainId: DEFAULT_CHAIN_ID,
  chains: [{ rpcUrl: RPC_URL }],
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
            chains={[mainnet]}
            connectors={connectors}
            explorer={voyager}
            provider={provider}
          >
            <AudioProvider>
              <EntitiesProvider>
                <GamesProvider>
                  <PracticeProvider>
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
                              <TutorialProvider>
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
                              </TutorialProvider>
                            </Router>
                          </LoadingProvider>
                        </WelcomeProvider>
                      </AchievementsProvider>
                    </QuestsProvider>
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
