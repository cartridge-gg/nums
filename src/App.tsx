import "./fonts.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Selection from "./pages/Selection";
import {
  StarknetConfig,
  voyager,
  jsonRpcProvider,
  Connector,
} from "@starknet-react/core";
import { Chain, sepolia, mainnet } from "@starknet-react/chains";
import { ControllerOptions, SessionPolicies } from "@cartridge/controller";
import ControllerConnector from "@cartridge/connector/controller";
import { AudioProvider } from "./context/audio";
import { UrqlProvider } from "./context/urql";
import {
  chains,
  DEFAULT_CHAIN_ID,
  getContractAddress,
  getNumsAddress,
  getVrfAddress,
  KATANA_CHAIN_ID,
  katanaChain,
  SLOT_CHAIN_ID,
  slotChain,
} from "./config";
import { DojoSdkProviderInitialized } from "./context/dojo";
import { Toaster } from "./components/ui/toaster";
import { JackpotProvider } from "./context/jackpots";
import { GameProvider } from "./context/game";
import { ConfigProvider } from "./context/config";
import { ControllersProvider } from "./context/controllers";
import Factories from "./pages/Factories";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      case sepolia:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      case katanaChain:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      case slotChain:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

const buildPolicies = () => {
  const chain = chains[DEFAULT_CHAIN_ID];

  const vrfAddress = getVrfAddress(chain.id);
  const numsAddress = getNumsAddress(chain.id);
  const gameAddress = getContractAddress(chain.id, "nums", "game_actions");
  const jackpotAddress = getContractAddress(
    chain.id,
    "nums",
    "jackpot_actions"
  );

  const policies: SessionPolicies = {
    contracts: {
      [vrfAddress]: {
        methods: [{ entrypoint: "request_random" }],
      },
      [numsAddress]: {
        methods: [{ entrypoint: "approve" }],
      },
      [gameAddress]: {
        methods: [{ entrypoint: "create_game" }, { entrypoint: "set_slot" }],
      },
      [jackpotAddress]: {
        methods: [
          { entrypoint: "claim_jackpot" },
          { entrypoint: "next_jackpot" },
        ],
      },
    },
  };

  if ([KATANA_CHAIN_ID, SLOT_CHAIN_ID].includes(`0x${chain.id.toString(16)}`)) {
    // @ts-ignore
    policies.contracts[numsAddress].methods.push({ entrypoint: "mint" });
  }

  return policies;
};

const buildChains = () => {
  const chain = chains[DEFAULT_CHAIN_ID];
  return [{ rpcUrl: chain.rpcUrls.default.http[0] }];
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
  namespace: "nums",
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
                    <JackpotProvider>
                      <Router>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/:gameId" element={<Game />} />
                          <Route path="/selection" element={<Selection />} />
                          <Route path="/factories" element={<Factories />} />
                        </Routes>
                      </Router>
                    </JackpotProvider>
                  </GameProvider>
                </ControllersProvider>
              </ConfigProvider>
            </AudioProvider>
          </UrqlProvider>
        </DojoSdkProviderInitialized>
      </StarknetConfig>
      <Toaster />
    </>
  );
}

export default App;
