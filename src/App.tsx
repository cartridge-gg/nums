import "./fonts.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./Game";
import Home from "./Home";
import {
  StarknetConfig,
  voyager,
  jsonRpcProvider,
  Connector,
} from "@starknet-react/core";
import { Chain, sepolia, mainnet } from "@starknet-react/chains";
import { ControllerOptions, SessionPolicies } from "@cartridge/controller";
import ControllerConnector from "@cartridge/connector/controller";
import { TotalsProvider } from "./context/totals";
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
} from "./config";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      case sepolia:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      case katanaChain:
        return { nodeUrl: chain.rpcUrls.default.http[0] };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

// const profile: ProfileOptions = {
// preset: "not_nums",
// slot: "nums-mainnet-appchain",
// namespace: "nums",
// };

const buildPolicies = () => {
  const chain = chains[DEFAULT_CHAIN_ID];

  const vrfAddress = getVrfAddress(chain.id);
  const numsAddress = getNumsAddress(chain.id);
  const gameAddress = getContractAddress(chain.id, "nums", "game_actions");

  const policies: SessionPolicies = {
    contracts: {
      [vrfAddress]: {
        methods: [{ entrypoint: "request_random" }],
      },
      [gameAddress]: {
        methods: [
          { entrypoint: "create_game" },
          { entrypoint: "set_slot" },
          { entrypoint: "king_me" },
        ],
      },
    },
  };

  if ([KATANA_CHAIN_ID, SLOT_CHAIN_ID].includes(`0x${chain.id.toString(16)}`)) {
    // @ts-ignore
    policies.contracts[numsAddress] = {
      methods: [{ entrypoint: "mint" }],
    };
  }

  return policies;
};

const options: ControllerOptions = {
  defaultChainId: DEFAULT_CHAIN_ID,
  chains: [
    { rpcUrl: import.meta.env.VITE_KATANA_RPC_URL },
    { rpcUrl: import.meta.env.VITE_SLOT_RPC_URL },
    { rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL },
    { rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL },
  ],
  policies: buildPolicies(),
  preset: "nums",
  namespace: "nums",
  // tokens: {
  //   erc20: [import.meta.env.VITE_NUMS_ERC20],
  // },
};

const connectors = [new ControllerConnector(options) as never as Connector];

function App() {
  return (
    <StarknetConfig
      autoConnect
      chains={[chains[DEFAULT_CHAIN_ID]]}
      connectors={connectors}
      explorer={voyager}
      provider={provider}
    >
      <UrqlProvider>
        <AudioProvider>
          <TotalsProvider>
            {/* <ClaimsProvider> */}
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:gameId" element={<Game />} />
              </Routes>
            </Router>
            {/* </ClaimsProvider> */}
          </TotalsProvider>
        </AudioProvider>
      </UrqlProvider>
    </StarknetConfig>
  );
}

export default App;
