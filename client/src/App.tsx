import ControllerConnector from "@cartridge/connector/controller";
import type { ControllerOptions, SessionPolicies } from "@cartridge/controller";
import { type Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  type Connector,
  jsonRpcProvider,
  StarknetConfig,
  voyager,
} from "@starknet-react/core";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import {
  chains,
  DEFAULT_CHAIN_ID,
  getContractAddress,
  getNumsAddress,
  getVrfAddress,
  NAMESPACE,
} from "@/config";
import { AudioProvider } from "./context/audio";
import { ConfigProvider } from "./context/config";
import { ControllersProvider } from "./context/controllers";
import { DojoSdkProviderInitialized } from "./context/dojo";
import { GameProvider } from "./context/game";
import { ModalProvider } from "./context/modal";
import { TournamentProvider } from "./context/tournaments";
import { UrqlProvider } from "./context/urql";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: chain.rpcUrls.cartridge.http[0] };
      case sepolia:
        return { nodeUrl: chain.rpcUrls.cartridge.http[0] };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

const buildPolicies = () => {
  const chain = chains[DEFAULT_CHAIN_ID];

  const vrfAddress = getVrfAddress(chain.id);
  const numsAddress = getNumsAddress(chain.id);
  const gameAddress = getContractAddress(chain.id, NAMESPACE, "Play");

  const policies: SessionPolicies = {
    contracts: {
      [vrfAddress]: {
        methods: [{ entrypoint: "request_random" }],
      },
      [numsAddress]: {
        methods: [{ entrypoint: "approve" }],
      },
      [gameAddress]: {
        methods: [{ entrypoint: "start" }, { entrypoint: "set" }],
      },
    },
  };

  return policies;
};

const buildChains = () => {
  const chain = chains[DEFAULT_CHAIN_ID];
  switch (chain) {
    case mainnet:
      return [{ rpcUrl: chain.rpcUrls.cartridge.http[0] }];
    case sepolia:
      return [{ rpcUrl: chain.rpcUrls.cartridge.http[0] }];
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

const options: ControllerOptions = {
  defaultChainId: DEFAULT_CHAIN_ID,
  chains: buildChains(),
  policies: buildPolicies(),
  preset: "nums",
  namespace: "NUMS",
  slot: "nums-bal",
  tokens: buildTokens(),
};

const connectors = [new ControllerConnector(options) as never as Connector];

function App() {
  return (
    <>
      <StarknetConfig
        autoConnect
        chains={[chains[DEFAULT_CHAIN_ID]]}
        connectors={connectors}
        explorer={voyager}
        provider={provider}
      >
        <DojoSdkProviderInitialized>
          <UrqlProvider>
            <AudioProvider>
              <ConfigProvider>
                <ControllersProvider>
                  <GameProvider>
                    <TournamentProvider>
                      <ModalProvider>
                        <Router>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/:gameId" element={<Game />} />
                            {/* <Route path="/selection" element={<Selection />} />
                            <Route path="/factories" element={<Factories />} /> */}
                          </Routes>
                        </Router>
                      </ModalProvider>
                    </TournamentProvider>
                  </GameProvider>
                </ControllersProvider>
              </ConfigProvider>
            </AudioProvider>
          </UrqlProvider>
        </DojoSdkProviderInitialized>
      </StarknetConfig>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
