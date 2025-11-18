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
import { Toaster } from "sonner";
import { chains, DEFAULT_CHAIN_ID, getNumsAddress } from "@/config";
import { AudioProvider } from "./context/audio";
import { ConfigProvider } from "./context/config";
import { ControllersProvider } from "./context/controllers";
import { DojoSdkProviderInitialized } from "./context/dojo";
import { ModalProvider } from "./context/modal";
import { TokenPricesProvider } from "./context/tokenPrices";
import { TournamentProvider } from "./context/tournaments";
import { UsageProvider } from "./context/usage";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { queryClient } from "./queries";

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

// const buildPolicies = () => {
//   const chain = chains[DEFAULT_CHAIN_ID];

//   const vrfAddress = getVrfAddress(chain.id);
//   const numsAddress = getNumsAddress(chain.id);
//   const gameAddress = getContractAddress(chain.id, NAMESPACE, "Play");

//   const policies: SessionPolicies = {
//     contracts: {
//       [vrfAddress]: {
//         methods: [{ entrypoint: "request_random" }],
//       },
//       [numsAddress]: {
//         methods: [{ entrypoint: "approve" }],
//       },
//       [gameAddress]: {
//         methods: [
//           { entrypoint: "start" },
//           { entrypoint: "set" },
//           { entrypoint: "apply" },
//         ],
//       },
//     },
//   };

//   return policies;
// };

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
  const numsAddress = getNumsAddress(chain.id);
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
          <DojoSdkProviderInitialized>
            <AudioProvider>
              <ConfigProvider>
                <UsageProvider>
                  <ControllersProvider>
                    <TournamentProvider>
                      <TokenPricesProvider>
                        <ModalProvider>
                          <Router>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/:gameId" element={<Game />} />
                            </Routes>
                          </Router>
                        </ModalProvider>
                      </TokenPricesProvider>
                    </TournamentProvider>
                  </ControllersProvider>
                </UsageProvider>
              </ConfigProvider>
            </AudioProvider>
          </DojoSdkProviderInitialized>
        </StarknetConfig>
      </QueryClientProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
