import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface LoadingContextType {
  isLoading: (type: "slot" | "power", index: number) => boolean;
  setLoading: (
    type: "slot" | "power",
    index: number | null,
    loading: boolean,
  ) => void;
  withLoading: <T>(
    type: "slot" | "power",
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

  const isLoading = useCallback(
    (type: "slot" | "power", index: number): boolean => {
      if (type === "slot") {
        return loadingSlots.has(index);
      }
      return loadingPowers.has(index);
    },
    [loadingSlots, loadingPowers],
  );

  const setLoading = useCallback(
    (type: "slot" | "power", index: number | null, loading: boolean) => {
      if (index === null) return;

      if (type === "slot") {
        setLoadingSlots((prev) => {
          const next = new Set(prev);
          if (loading) {
            next.add(index);
          } else {
            next.delete(index);
          }
          return next;
        });
      } else {
        setLoadingPowers((prev) => {
          const next = new Set(prev);
          if (loading) {
            next.add(index);
          } else {
            next.delete(index);
          }
          return next;
        });
      }
    },
    [],
  );

  const withLoading = useCallback(
    async <T,>(
      type: "slot" | "power",
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
    <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
