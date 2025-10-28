import React, { createContext, useContext, useCallback, useMemo } from "react";
import {
  Client,
  Provider,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";
import { getGraphqlUrl } from "../network";
import { useNetwork } from "@starknet-react/core";

interface UrqlContextType {
  client: Client;
}

const UrqlContext = createContext<UrqlContextType>(null!);

export const useUrqlClient = () => useContext(UrqlContext);

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  const { chain } = useNetwork();
  const createClient = useCallback((url: string, wsUrl: string) => {
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
  }, []);

  const client = useMemo(() => {
    const urls = getGraphqlUrl(chain);
    return createClient(urls.url, urls.wsUrl);
  }, [chain]);

  return (
    <UrqlContext.Provider value={{ client }}>
      <Provider value={client}>{children}</Provider>
    </UrqlContext.Provider>
  );
}
