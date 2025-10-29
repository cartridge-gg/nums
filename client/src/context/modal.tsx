import { createContext, type ReactNode, useContext, useState } from "react";

type ModalContextType = {
  isInventoryOpen: boolean;
  isInventoryClosing: boolean;
  openInventory: () => void;
  closeInventory: () => void;
  finalizeCloseInventory: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isInventoryClosing, setIsInventoryClosing] = useState(false);

  const openInventory = () => {
    setIsInventoryOpen(true);
    setIsInventoryClosing(false);
  };

  const closeInventory = () => {
    setIsInventoryClosing(true);
  };

  const finalizeCloseInventory = () => {
    setIsInventoryOpen(false);
    setIsInventoryClosing(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isInventoryOpen,
        isInventoryClosing,
        openInventory,
        closeInventory,
        finalizeCloseInventory,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
