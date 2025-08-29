import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";
import {
  SEPOLIA_CHAIN_ID,
  MAINNET_CHAIN_ID,
  SLOT_CHAIN_ID,
  slotChain,
  KATANA_CHAIN_ID,
  katanaChain,
} from "@/config";
import { mainnet, sepolia } from "@starknet-react/chains";

const createClient = (url: string, wsUrl: string) => {
  const wsClient = createWSClient({
    url: wsUrl,
  });

  return new Client({
    url,
    exchanges: [
      cacheExchange,
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(request) {
          const input = { ...request, query: request.query || "" };
          return {
            subscribe(sink) {
              const unsubscribe = wsClient.subscribe(input, sink);
              return { unsubscribe };
            },
          };
        },
      }),
    ],
  });
};

// export const AppchainClient = createClient(
//   import.meta.env.VITE_APPCHAIN_GRAPHQL_URL,
//   import.meta.env.VITE_APPCHAIN_GRAPHQL_WS_URL,
// );

export const KatanaChainClient = createClient(
  import.meta.env.VITE_KATANA_GRAPHQL_URL,
  import.meta.env.VITE_KATANA_GRAPHQL_WS_URL
);

export const SlotChainClient = createClient(
  import.meta.env.VITE_SLOT_GRAPHQL_URL,
  import.meta.env.VITE_SLOT_GRAPHQL_WS_URL
);

export const StarknetMainnetClient = createClient(
  import.meta.env.VITE_MAINNET_GRAPHQL_URL,
  import.meta.env.VITE_MAINNET_GRAPHQL_WS_URL
);

export const StarknetSepoliaClient = createClient(
  import.meta.env.VITE_SEPOLIA_GRAPHQL_URL,
  import.meta.env.VITE_SEPOLIA_GRAPHQL_WS_URL
);

export const graphQlClients = {
  [SEPOLIA_CHAIN_ID]: StarknetSepoliaClient,
  [MAINNET_CHAIN_ID]: StarknetMainnetClient,
  [SLOT_CHAIN_ID]: SlotChainClient,
  [KATANA_CHAIN_ID]: KatanaChainClient,
};
