import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const FADE_OUT_DURATION_MS = 1000;

interface WelcomeContextType {
  isDismissed: boolean;
  isDismissing: boolean;
  dismiss: () => void;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

export const useWelcome = () => {
  const context = useContext(WelcomeContext);
  if (context === undefined) {
    throw new Error("useWelcome must be used within a WelcomeProvider");
  }
  return context;
};

interface WelcomeProviderProps {
  children: ReactNode;
}

export const WelcomeProvider = ({ children }: WelcomeProviderProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const dismiss = useCallback(() => {
    setIsDismissing(true);
  }, []);

  useEffect(() => {
    if (!isDismissing) return;
    const timer = setTimeout(() => {
      setIsDismissed(true);
      setIsDismissing(false);
    }, FADE_OUT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isDismissing]);

  return (
    <WelcomeContext.Provider value={{ isDismissed, isDismissing, dismiss }}>
      {children}
    </WelcomeContext.Provider>
  );
};
