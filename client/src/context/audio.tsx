import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playPositive: () => void;
  playNegative: () => void;
  playReplay: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  playPositive: () => {},
  playNegative: () => {},
  playReplay: () => {},
});

export const useAudio = () => useContext(AudioContext);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage, defaulting to false if not set
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("audioMuted");
    return saved ? JSON.parse(saved) : false;
  });

  // Create audio instances once at the provider level
  const positive = new Audio("/sounds/esm_positive.wav");
  const negative = new Audio("/sounds/esm_negative.wav");
  const replay = new Audio("/sounds/esm_replay.wav");

  // Update localStorage whenever mute state changes
  useEffect(() => {
    localStorage.setItem("audioMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev: boolean) => !prev);
  };

  const playPositive = useCallback(() => {
    if (!isMuted) {
      positive.play();
    }
  }, [isMuted]);

  const playNegative = useCallback(() => {
    if (!isMuted) {
      negative.play();
    }
  }, [isMuted]);

  const playReplay = useCallback(() => {
    if (!isMuted) {
      replay.play();
    }
  }, [isMuted]);

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        toggleMute,
        playPositive,
        playNegative,
        playReplay,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
