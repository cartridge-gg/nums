import type { Controller } from "@dojoengine/torii-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { BigNumberish } from "starknet";
import { useDojoSdk } from "../hooks/dojo";

type ControllersProviderProps = {
  children: React.ReactNode;
};

type ControllersProviderState = {
  controllers?: Controller[];
  refreshControllers: any;
  findController: (address: string) => Controller | undefined;
};

const ControllersProviderContext = createContext<
  ControllersProviderState | undefined
>(undefined);

export function ControllersProvider({
  children,
  ...props
}: ControllersProviderProps) {
  const { sdk } = useDojoSdk();
  const [controllers, setControllers] = useState<Controller[]>();

  const refreshControllers = async () => {
    // fetch all
    const res = await sdk.getControllers([], [], {
      cursor: undefined,
      direction: "Backward",
      limit: 50_000,
      order_by: [],
    });

    setControllers(res.items as Controller[]);
  };

  const findController = useCallback(
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
    refreshControllers();
  }, []);

  if (!controllers) return null;

  return (
    <ControllersProviderContext.Provider
      {...props}
      value={{
        controllers,
        refreshControllers,
        findController,
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
