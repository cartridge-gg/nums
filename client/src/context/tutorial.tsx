import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Tutorial, TutorialPhase, type TutorialData } from "@/models/tutorial";
import { Game } from "@/models/game";
import { usePractice } from "@/context/practice";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useLocation } from "react-router-dom";
import { useHeader } from "@/hooks/header";

const STORAGE_KEY = "tutorial-completed";

interface TutorialContextType {
  phase: TutorialPhase | null;
  data: TutorialData | null;
  isActive: boolean;
  next: () => void;
  skip: () => void;
  restart: () => void;
  propose: (onProceed: () => void) => void;
}

const TutorialContext = createContext<TutorialContextType>({
  phase: null,
  data: null,
  isActive: false,
  next: () => {},
  skip: () => {},
  restart: () => {},
  propose: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const navigate = usePreserveSearchNavigate();
  const location = useLocation();
  const { supply: currentSupply } = useHeader();
  const { game, setGame, clearGame } = usePractice();

  const [phase, setPhase] = useState<TutorialPhase | null>(null);
  const onProceedRef = useRef<(() => void) | null>(null);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setPhase(null);
  }, []);

  const propose = useCallback((onProceed: () => void) => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) {
      onProceed();
      return;
    }
    onProceedRef.current = onProceed;
    setPhase(TutorialPhase.Initialization);
  }, []);

  const next = useCallback(() => {
    if (phase === null) return;

    const nextPhase = Tutorial.next(phase);
    if (nextPhase === null) {
      complete();
      return;
    }

    if (phase === TutorialPhase.Initialization) {
      onProceedRef.current = null;
      clearGame();
      const tutorialGame = Game.tutorial(currentSupply);
      setGame(tutorialGame);
      navigate("/tutorial");
    }

    setPhase(nextPhase);
  }, [phase, complete, clearGame, setGame, currentSupply, navigate]);

  const skip = useCallback(() => {
    const proceed = onProceedRef.current;
    onProceedRef.current = null;
    setPhase(null);
    proceed?.();
  }, []);

  const restart = useCallback(() => {
    setPhase(TutorialPhase.Initialization);
  }, []);

  const prevLevelRef = useRef<number>(0);
  const prevSelectableRef = useRef<number>(0);

  useEffect(() => {
    if (!game || phase === null) return;
    const data = Tutorial.getData(phase);

    if (game.level > prevLevelRef.current && data.anchor?.type === "slot") {
      const nextPhase = Tutorial.next(phase);
      if (nextPhase !== null) setPhase(nextPhase);
    }

    if (
      prevSelectableRef.current > 0 &&
      game.selectable_powers.length === 0 &&
      data.anchor?.type === "powers"
    ) {
      const nextPhase = Tutorial.next(phase);
      if (nextPhase !== null) setPhase(nextPhase);
    }

    prevLevelRef.current = game.level;
    prevSelectableRef.current = game.selectable_powers.length;
  }, [game?.level, game?.selectable_powers.length, phase]);

  const isInitialization = phase === TutorialPhase.Initialization;
  const isOnTutorialRoute = location.pathname === "/tutorial";
  const isVisible = phase !== null && (isInitialization || isOnTutorialRoute);

  const isActive = isVisible;
  const data = isVisible && phase !== null ? Tutorial.getData(phase) : null;

  return (
    <TutorialContext.Provider
      value={{ phase, data, isActive, next, skip, restart, propose }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
