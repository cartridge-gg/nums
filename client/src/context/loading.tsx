import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

type LoadingType = "slot" | "power" | "select";

interface LoadingContextType {
  isLoading: (type: LoadingType, index: number) => boolean;
  setLoading: (
    type: LoadingType,
    index: number | null,
    loading: boolean,
  ) => void;
  resetAll: (type: LoadingType) => void;
  withLoading: <T>(
    type: LoadingType,
    index: number,
    action: () => Promise<T>,
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [loadingSlots, setLoadingSlots] = useState<Set<number>>(new Set());
  const [loadingPowers, setLoadingPowers] = useState<Set<number>>(new Set());
  const [loadingSelects, setLoadingSelects] = useState<Set<number>>(new Set());

  type SetState = React.Dispatch<React.SetStateAction<Set<number>>>;
  const setterMap = useMemo<Record<LoadingType, SetState>>(
    () => ({
      slot: setLoadingSlots,
      power: setLoadingPowers,
      select: setLoadingSelects,
    }),
    [],
  );

  const isLoading = useCallback(
    (type: LoadingType, index: number): boolean => {
      if (type === "slot") return loadingSlots.has(index);
      if (type === "power") return loadingPowers.has(index);
      return loadingSelects.has(index);
    },
    [loadingSlots, loadingPowers, loadingSelects],
  );

  const setLoading = useCallback(
    (type: LoadingType, index: number | null, loading: boolean) => {
      if (index === null) return;
      const setter = setterMap[type];
      setter((prev) => {
        const next = new Set(prev);
        if (loading) {
          next.add(index);
        } else {
          next.delete(index);
        }
        return next;
      });
    },
    [setterMap],
  );

  const resetAll = useCallback(
    (type: LoadingType) => {
      setterMap[type](new Set());
    },
    [setterMap],
  );

  const withLoading = useCallback(
    async <T,>(
      type: LoadingType,
      index: number,
      action: () => Promise<T>,
    ): Promise<T> => {
      setLoading(type, index, true);
      try {
        const result = await action();
        return result;
      } finally {
        // Loading will be reset by the action if transaction fails, or stays active if success
        // The loading will be reset when the game model changes (handled in actions)
      }
    },
    [setLoading],
  );

  return (
    <LoadingContext.Provider
      value={{ isLoading, setLoading, resetAll, withLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
