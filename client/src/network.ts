import { type Chain, mainnet, sepolia } from "@starknet-react/chains";

type GraphqlUrl = {
  url: string;
  wsUrl: string;
};

export const getGraphqlUrl = (chain: Chain): GraphqlUrl => {
  switch (chain) {
    case mainnet:
      return {
        url: import.meta.env.VITE_SN_MAIN_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_SN_MAIN_GRAPHQL_WS_URL,
      };
    case sepolia:
      return {
        url: import.meta.env.VITE_SN_SEPOLIA_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_SN_SEPOLIA_GRAPHQL_WS_URL,
      };
    default:
      return {
        url: import.meta.env.VITE_SN_SEPOLIA_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_SN_SEPOLIA_GRAPHQL_WS_URL,
      };
  }
};
