import { createContext, useContext, type ReactNode } from "react";

type PurchaseModalContextType = {
  openPurchaseScene: () => void;
};

const PurchaseModalContext = createContext<
  PurchaseModalContextType | undefined
>(undefined);

export function PurchaseModalProvider({
  children,
  openPurchaseScene,
}: {
  children: ReactNode;
  openPurchaseScene: () => void;
}) {
  return (
    <PurchaseModalContext.Provider value={{ openPurchaseScene }}>
      {children}
    </PurchaseModalContext.Provider>
  );
}

export const usePurchaseModal = () => {
  const context = useContext(PurchaseModalContext);
  if (context === undefined) {
    throw new Error(
      "usePurchaseModal must be used within a PurchaseModalProvider",
    );
  }
  return context;
};
