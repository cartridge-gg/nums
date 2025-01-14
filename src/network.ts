import { Chain, mainnet, sepolia } from "@starknet-react/chains";

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
    default:
      return {
        url: import.meta.env.VITE_SLOT_GRAPHQL_URL,
        wsUrl: import.meta.env.VITE_SLOT_GRAPHQL_WS_URL,
      };
  }

  // const hostname = window.location.hostname;
  // if (
  //   hostname.startsWith("slot.") ||
  //   hostname.includes("ngrok-free") ||
  //   hostname === "localhost"
  // ) {
  //   return {
  //     url: import.meta.env.VITE_SLOT_GRAPHQL_URL,
  //     wsUrl: import.meta.env.VITE_SLOT_GRAPHQL_WS_URL,
  //   };
  // }

  // if (hostname.startsWith("mainnet.")) {
  //   return {
  //     url: import.meta.env.VITE_MAINNET_GRAPHQL_URL,
  //     wsUrl: import.meta.env.VITE_MAINNET_GRAPHQL_WS_URL,
  //   };
  // }

  // return {
  //   url: import.meta.env.VITE_SEPOLIA_GRAPHQL_URL,
  //   wsUrl: import.meta.env.VITE_SEPOLIA_GRAPHQL_WS_URL,
  // };
};
