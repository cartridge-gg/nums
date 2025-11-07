import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playPositive: () => void;
  playNegative: () => void;
  playReplay: () => void;
  playClick: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  playPositive: () => {},
  playNegative: () => {},
  playReplay: () => {},
  playClick: () => {},
});

export const useAudio = () => useContext(AudioContext);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage, defaulting to false if not set
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("audioMuted");
    return saved ? JSON.parse(saved) : false;
  });

  const positive = useMemo(() => {
    const audio = new Audio("/sounds/esm_positive.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const negative = useMemo(() => {
    const audio = new Audio("/sounds/esm_negative.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const replay = useMemo(() => {
    const audio = new Audio("/sounds/esm_replay.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const click = useMemo(() => {
    const audio = new Audio("/sounds/click.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  // Update localStorage whenever mute state changes
  useEffect(() => {
    localStorage.setItem("audioMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev: boolean) => !prev);
  };

  const playPositive = useCallback(() => {
    if (!isMuted) {
      positive.currentTime = 0;
      void positive.play().catch(() => {});
    }
  }, [isMuted, positive]);

  const playNegative = useCallback(() => {
    if (!isMuted) {
      negative.currentTime = 0;
      void negative.play().catch(() => {});
    }
  }, [isMuted, negative]);

  const playReplay = useCallback(() => {
    if (!isMuted) {
      replay.currentTime = 0;
      void replay.play().catch(() => {});
    }
  }, [isMuted, replay]);

  const playClick = useCallback(() => {
    if (!isMuted) {
      click.currentTime = 0;
      void click.play().catch(() => {});
    }
  }, [click, isMuted]);

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        toggleMute,
        playPositive,
        playNegative,
        playReplay,
        playClick,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
