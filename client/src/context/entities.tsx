import type * as torii from "@dojoengine/torii-wasm";
import { useSetAtom } from "jotai";
import { createContext, useContext, useEffect } from "react";
import { toriiClientAtom } from "@/atoms";
import type {
  Claimed,
  Config,
  Purchased,
  Score,
  Started,
  Starterpack,
} from "@/models";
import { OFFLINE_CONFIG, OFFLINE_STARTERPACKS } from "@/constants/offline";

type EntitiesProviderProps = {
  children: React.ReactNode;
};

type EntitiesProviderState = {
  client?: torii.ToriiClient | null;
  config?: Config;
  starterpacks: Starterpack[];
  purchaseds: Purchased[];
  purchased: Purchased | undefined;
  starteds: Started[];
  started: Started | undefined;
  scores: Score[];
  claimeds: Claimed[];
  claimed: Claimed | undefined;
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
};

const EntitiesProviderContext = createContext<
  EntitiesProviderState | undefined
>(undefined);

export function EntitiesProvider({
  children,
  ...props
}: EntitiesProviderProps) {
  const setToriiClient = useSetAtom(toriiClientAtom);

  useEffect(() => {
    setToriiClient(null);
  }, [setToriiClient]);

  const value: EntitiesProviderState = {
    client: null,
    config: OFFLINE_CONFIG,
    starterpacks: OFFLINE_STARTERPACKS,
    scores: [],
    purchaseds: [],
    purchased: undefined,
    starteds: [],
    started: undefined,
    claimeds: [],
    claimed: undefined,
    status: "success",
    refresh: async () => {},
  };

  return (
    <EntitiesProviderContext.Provider {...props} value={value}>
      {children}
    </EntitiesProviderContext.Provider>
  );
}

export const useEntities = () => {
  const context = useContext(EntitiesProviderContext);

  if (context === undefined)
    throw new Error("useEntities must be used within a EntitiesProvider");

  return context;
};
