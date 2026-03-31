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
import { chains, DEFAULT_CHAIN_ID } from "@/config";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "./context/audio";
import { SoundProvider } from "./context/sound";
import { ThemeProvider } from "./context/theme";
import { EntitiesProvider } from "./context/entities";
import { PracticeProvider } from "./context/practice";
import { Game, Home, Main, Support } from "./pages";
import { LoadingScene, WelcomeScene } from "./components/scenes";
import { queryClient } from "./queries";
import { QuestsProvider } from "./context/quests";
import { LoadingProvider } from "./context/loading";
import { WelcomeProvider } from "./context/welcome";
import { AchievementsProvider } from "./context/achievements";
import { TutorialProvider } from "./context/tutorial";
import { VaultProvider } from "./context/vault";
import { BundlesProvider } from "./context/bundles";
import { GamesProvider } from "./context/games";
import { MerkledropsProvider } from "./context/merkledrops";
import { PostHogProvider } from "./context/posthog";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: import.meta.env.VITE_SN_MAIN_RPC_URL };
      case sepolia:
        return { nodeUrl: import.meta.env.VITE_SN_SEPOLIA_RPC_URL };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

const buildChains = () => {
  const chain = chains[DEFAULT_CHAIN_ID];
  switch (chain) {
    case mainnet:
      return [{ rpcUrl: import.meta.env.VITE_SN_MAIN_RPC_URL }];
    case sepolia:
      return [{ rpcUrl: import.meta.env.VITE_SN_SEPOLIA_RPC_URL }];
    default:
      throw new Error(`Unsupported chain: ${chain.network}`);
  }
};

const slot = import.meta.env[
  `VITE_${import.meta.env.VITE_DEFAULT_CHAIN}_TORII_URL`
]
  .split("/")
  .slice(-2, -1)[0];
const options: ControllerOptions = {
  defaultChainId: DEFAULT_CHAIN_ID,
  chains: buildChains(),
  // policies: buildPolicies(),
  preset: "nums",
  namespace: "NUMS",
  slot: slot,
  locationGate: {
    blocked: [
      "US-HI",
      "US-TN",
      "US-ID",
      "US-AR",
      "US-LA",
      "US-CT",
      "US-MT",
      "US-NV",
      "US-WA",
      "US-SD",
      "CA-ON",
      "CA-AB",
      "FR",
      "NL",
      "AU",
      "AT",
      "GB",
      "ES",
      "SG",
      "CN",
    ],
  },
} as ControllerOptions;

const connectors = [new ControllerConnector(options) as never as Connector];

function DeployGate() {
  const bypass = new URLSearchParams(window.location.search).has("bypass");

  if (!bypass) {
    return (
      <div className="h-screen w-screen">
        <WelcomeScene
          close={() => {}}
          content="Coming soon"
          className="absolute inset-0 z-[100] w-full h-full"
        />
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/support" element={<Support />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <JotaiProvider>
      <TooltipProvider delayDuration={300}>
        <QueryClientProvider client={queryClient}>
          <StarknetConfig
            autoConnect
            chains={[chains[DEFAULT_CHAIN_ID]]}
            connectors={connectors}
            explorer={voyager}
            provider={provider}
          >
            <DeployGate />
          </StarknetConfig>
        </QueryClientProvider>
      </TooltipProvider>
    </JotaiProvider>
  );
}

function AuthenticatedApp() {
  return (
    <PostHogProvider>
      <AudioProvider>
        <EntitiesProvider>
          <BundlesProvider>
            <GamesProvider>
              <PracticeProvider>
                <TutorialProvider>
                  <QuestsProvider>
                    <VaultProvider>
                      <AchievementsProvider>
                        <MerkledropsProvider>
                          <WelcomeProvider>
                            <LoadingProvider>
                              <ThemeProvider>
                                <SoundProvider>
                                  <Main>
                                    <Routes>
                                      <Route path="/" element={<Home />} />
                                      <Route
                                        path="/game/:id"
                                        element={<Game />}
                                      />
                                      <Route
                                        path="/game"
                                        element={<LoadingScene />}
                                      />
                                      <Route
                                        path="/practice"
                                        element={<Game />}
                                      />
                                      <Route
                                        path="/tutorial"
                                        element={<Game />}
                                      />
                                    </Routes>
                                  </Main>
                                </SoundProvider>
                              </ThemeProvider>
                            </LoadingProvider>
                          </WelcomeProvider>
                        </MerkledropsProvider>
                      </AchievementsProvider>
                    </VaultProvider>
                  </QuestsProvider>
                </TutorialProvider>
              </PracticeProvider>
            </GamesProvider>
          </BundlesProvider>
        </EntitiesProvider>
      </AudioProvider>
    </PostHogProvider>
  );
}

export default App;
