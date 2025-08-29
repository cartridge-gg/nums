import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { slotChain } from "./config";

type GraphqlUrl = {
  url: string;
  wsUrl: string;
};

export const getGraphqlUrl = (chain: Chain): GraphqlUrl => {
  switch (chain) {
    case mainnet:
      return {
        url: import.meta.env.VITE_MAINNET_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_MAINNET_GRAPHQL_WS_URL,
      };
    case sepolia:
      return {
        url: import.meta.env.VITE_SEPOLIA_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_SEPOLIA_GRAPHQL_WS_URL,
      };
    case slotChain:
      return {
        url: import.meta.env.VITE_SLOT_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_SLOT_GRAPHQL_WS_URL,
      };
    default:
      return {
        url: import.meta.env.VITE_KATANA_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_KATANA_GRAPHQL_WS_URL,
      };
  }
};
