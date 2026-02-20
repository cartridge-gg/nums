import type { Controller } from "@dojoengine/torii-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { BigNumberish } from "starknet";
import { useEntities } from "./entities";

type ControllersProviderProps = {
  children: React.ReactNode;
};

type ControllersProviderState = {
  controllers?: Controller[];
  refresh: () => Promise<void>;
  find: (address: string) => Controller | undefined;
  loading: boolean;
};

const ControllersProviderContext = createContext<
  ControllersProviderState | undefined
>(undefined);

export function ControllersProvider({
  children,
  ...props
}: ControllersProviderProps) {
  const { client } = useEntities();
  const [controllers, setControllers] = useState<Controller[]>();
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!client) return;
    // fetch all
    const res = await client.getControllers({
      contract_addresses: [],
      usernames: [],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: 50_000,
        order_by: [],
      },
    });
    setControllers(res.items as Controller[]);
    setLoading(false);
  };

  const find = useCallback(
    (address: BigNumberish) => {
      try {
        return controllers?.find((i) => BigInt(i.address) === BigInt(address));
      } catch (_e: any) {
        return undefined;
      }
    },
    [controllers],
  );

  useEffect(() => {
    refresh();
  }, [client]);

  return (
    <ControllersProviderContext.Provider
      {...props}
      value={{
        controllers: controllers ?? [],
        refresh,
        find,
        loading,
      }}
    >
      {children}
    </ControllersProviderContext.Provider>
  );
}

export const useControllers = () => {
  const context = useContext(ControllersProviderContext);

  if (context === undefined)
    throw new Error("useControllers must be used within a ControllersProvider");

  return context;
};
