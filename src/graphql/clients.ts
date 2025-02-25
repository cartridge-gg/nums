import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";

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

export const AppchainClient = createClient(
  import.meta.env.VITE_APPCHAIN_GRAPHQL_URL,
  import.meta.env.VITE_APPCHAIN_GRAPHQL_WS_URL,
);

export const StarknetClient = createClient(
  import.meta.env.VITE_MAINNET_GRAPHQL_URL,
  import.meta.env.VITE_MAINNET_GRAPHQL_WS_URL,
);
