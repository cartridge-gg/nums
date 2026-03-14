import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  TUTORIAL_SCRIPT,
  type TutorialScriptStep,
} from "@/tutorial/script";

const TUTORIAL_STORAGE_KEY = "nums-tutorial-completed";

interface TutorialContextType {
  isActive: boolean;
  hasCompleted: boolean;
  currentStep: TutorialScriptStep | null;
  stepIndex: number;
  totalSteps: number;
  advance: () => void;
  back: () => void;
  skip: () => void;
  startTutorial: () => void;
  isTutorialMode: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider = ({ children }: TutorialProviderProps) => {
  const [hasCompleted, setHasCompleted] = useState(() => {
    try {
      return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const markCompleted = useCallback(() => {
    setHasCompleted(true);
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    } catch {
      // localStorage unavailable
    }
  }, []);

  const currentStep = useMemo<TutorialScriptStep | null>(() => {
    if (!isActive || stepIndex >= TUTORIAL_SCRIPT.length) return null;
    return TUTORIAL_SCRIPT[stepIndex];
  }, [isActive, stepIndex]);

  const advance = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= TUTORIAL_SCRIPT.length) {
        setIsActive(false);
        markCompleted();
        return 0;
      }
      return next;
    });
  }, [markCompleted]);

  const back = useCallback(() => {
    setStepIndex((prev) => {
      if (prev <= 0) return 0;
      // Only allow going back to tooltip steps (skip action/state-override steps)
      let target = prev - 1;
      while (target > 0 && TUTORIAL_SCRIPT[target].type !== "tooltip") {
        target--;
      }
      return target;
    });
  }, []);

  const skip = useCallback(() => {
    setIsActive(false);
    setStepIndex(0);
    markCompleted();
  }, [markCompleted]);

  const startTutorial = useCallback(() => {
    setStepIndex(0);
    setIsActive(true);
  }, []);

  const isTutorialMode = isActive;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        hasCompleted,
        currentStep,
        stepIndex,
        totalSteps: TUTORIAL_SCRIPT.length,
        advance,
        back,
        skip,
        startTutorial,
        isTutorialMode,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};
