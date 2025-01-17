import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./components/Game";
import Home from "./components/Home";
import {
  StarknetConfig,
  voyager,
  jsonRpcProvider,
  Connector,
} from "@starknet-react/core";
import { Chain, sepolia, mainnet } from "@starknet-react/chains";
import { ControllerOptions } from "@cartridge/controller";
import { SessionPolicies } from "@cartridge/controller";
import ControllerConnector from "@cartridge/connector/controller";
import { constants, num, shortString } from "starknet";
import { UrqlProvider } from "./UrqlContext";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: import.meta.env.VITE_MAINNET_RPC_URL };
      case sepolia:
        return { nodeUrl: import.meta.env.VITE_SEPOLIA_RPC_URL };
      case slot:
        return { nodeUrl: import.meta.env.VITE_SLOT_RPC_URL };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

const policies: SessionPolicies = {
  contracts: {
    [import.meta.env.VITE_GAME_CONTRACT]: {
      methods: [
        {
          name: "Create Game",
          entrypoint: "create_game",
          description: "Creates a new game",
        },
        {
          name: "Set Slot",
          entrypoint: "set_slot",
          description: "Sets one slot for the game",
        },
        {
          name: "Request Random",
          entrypoint: "request_random",
          description: "Requests a random number from the VRF contract",
        },
      ],
    },
  },
};

const options: ControllerOptions = {
  policies,
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  chains: [
    { rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL },
    { rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL },
    { rpcUrl: import.meta.env.VITE_SLOT_RPC_URL },
  ],
  tokens: {
    erc20: [import.meta.env.VITE_NUMS_ERC20],
  },
};

const connectors = [new ControllerConnector(options) as never as Connector];

const slot: Chain = {
  id: num.toBigInt(shortString.encodeShortString("WP_NUMS_SLOT")),
  network: "slot",
  name: "Nums Chain",
  rpcUrls: {
    default: import.meta.env.VITE_SLOT_RPC_URL,
    public: import.meta.env.VITE_SLOT_RPC_URL,
  },
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    address: import.meta.env.VITE_ETH_ADDRESS,
  },
};

function App() {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia, mainnet, slot]}
      connectors={connectors}
      explorer={voyager}
      provider={provider}
    >
      <UrqlProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:gameId" element={<Game />} />
          </Routes>
        </Router>
      </UrqlProvider>
    </StarknetConfig>
  );
}

export default App;
