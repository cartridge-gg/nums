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
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { chains, DEFAULT_CHAIN_ID, getTokenAddress } from "@/config";
import { AudioProvider } from "./context/audio";
import { ControllersProvider } from "./context/controllers";
import { EntitiesProvider } from "./context/entities";
import { PracticeProvider } from "./context/practice";
import { Game, Home } from "./pages";
import { queryClient } from "./queries";
import { QuestsProvider } from "./context/quests";
import { PricesProvider } from "./context/prices";
import { LoadingProvider } from "./context/loading";
import { Layout } from "./components/layouts";
import { AchievementsProvider } from "./context/achievements";

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

const buildTokens = () => {
  const chain = chains[DEFAULT_CHAIN_ID];
  const numsAddress = getTokenAddress(chain.id);
  return {
    erc20: [numsAddress],
  };
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
  tokens: buildTokens(),
};

const connectors = [new ControllerConnector(options) as never as Connector];

function App() {
  return (
    <>
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
              <PracticeProvider>
                <ControllersProvider>
                  <QuestsProvider>
                    <AchievementsProvider>
                      <PricesProvider>
                        <LoadingProvider>
                          <Router
                            future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true,
                            }}
                          >
                            <Layout>
                              <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/game" element={<Game />} />
                                <Route path="/practice" element={<Game />} />
                              </Routes>
                            </Layout>
                          </Router>
                        </LoadingProvider>
                      </PricesProvider>
                    </AchievementsProvider>
                  </QuestsProvider>
                </ControllersProvider>
              </PracticeProvider>
            </EntitiesProvider>
          </AudioProvider>
        </StarknetConfig>
      </QueryClientProvider>
    </>
  );
}

export default App;
