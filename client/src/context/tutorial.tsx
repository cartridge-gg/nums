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

const STORAGE_KEY = "tutorial-completed";

interface TutorialContextType {
  phase: TutorialPhase | null;
  data: TutorialData | null;
  isActive: boolean;
  isPaused: boolean;
  next: () => void;
  skip: () => void;
  restart: () => void;
  propose: (onProceed: () => void) => void;
  pause: () => void;
  resume: () => void;
}

const TutorialContext = createContext<TutorialContextType>({
  phase: null,
  data: null,
  isActive: false,
  isPaused: false,
  next: () => {},
  skip: () => {},
  restart: () => {},
  propose: () => {},
  pause: () => {},
  resume: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const navigate = usePreserveSearchNavigate();
  const location = useLocation();
  const { game, setGame, clearGame } = usePractice();

  const [phase, setPhase] = useState<TutorialPhase | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const onProceedRef = useRef<(() => void) | null>(null);
  const completingRef = useRef(false);
  const isOnTutorialRoute = location.pathname === "/tutorial";

  const complete = useCallback(() => {
    const proceed = onProceedRef.current;
    onProceedRef.current = null;
    completingRef.current = true;
    localStorage.setItem(STORAGE_KEY, "true");
    setPhase(null);
    navigate("/");
    proceed?.();
  }, [navigate]);

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

    if (phase === TutorialPhase.Initialization && !isOnTutorialRoute) {
      clearGame();
      const tutorialGame = Game.tutorial();
      setGame(tutorialGame);
      navigate("/tutorial");
    }

    setPhase(nextPhase);
  }, [phase, complete, clearGame, setGame, navigate, isOnTutorialRoute]);

  const skip = useCallback(() => {
    const proceed = onProceedRef.current;
    onProceedRef.current = null;
    localStorage.setItem(STORAGE_KEY, "true");
    setPhase(null);
    proceed?.();
  }, []);

  const restart = useCallback(() => {
    setPhase(TutorialPhase.Initialization);
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    if (!isOnTutorialRoute || phase !== null) return;
    if (completingRef.current) {
      completingRef.current = false;
      return;
    }
    clearGame();
    const tutorialGame = Game.tutorial();
    setGame(tutorialGame);
    setPhase(TutorialPhase.Initialization);
  }, [isOnTutorialRoute, phase, clearGame, setGame]);

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
      data.anchor?.type === "select"
    ) {
      const nextPhase = Tutorial.next(phase);
      if (nextPhase !== null) setPhase(nextPhase);
    }

    prevLevelRef.current = game.level;
    prevSelectableRef.current = game.selectable_powers.length;
  }, [game?.level, game?.selectable_powers.length, phase]);

  const isInitialization = phase === TutorialPhase.Initialization;
  const isVisible = phase !== null && (isInitialization || isOnTutorialRoute);

  const isActive = isVisible;
  const data = isVisible && phase !== null ? Tutorial.getData(phase) : null;

  return (
    <TutorialContext.Provider
      value={{
        phase,
        data,
        isActive,
        isPaused,
        next,
        skip,
        restart,
        propose,
        pause,
        resume,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
