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
  volume: number;
  setVolume: (v: number) => void;
  playPositive: () => void;
  playNegative: () => void;
  playReplay: () => void;
  playClick: () => void;
  playSlots: () => void;
  playReroll: () => void;
  playUfo: () => void;
  playWindy: () => void;
  playMagnet: () => void;
  playBomb: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  volume: 100,
  setVolume: () => {},
  playPositive: () => {},
  playNegative: () => {},
  playReplay: () => {},
  playClick: () => {},
  playSlots: () => {},
  playReroll: () => {},
  playUfo: () => {},
  playWindy: () => {},
  playMagnet: () => {},
  playBomb: () => {},
});

export const useAudio = () => useContext(AudioContext);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage, defaulting to false if not set
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("audioMuted");
    return saved ? JSON.parse(saved) : false;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem("audioVolume");
    return saved ? Number(JSON.parse(saved)) : 100;
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

  const slots = useMemo(() => {
    const audio = new Audio("/sounds/slots.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const reroll = useMemo(() => {
    const audio = new Audio("/sounds/reroll.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const ufo = useMemo(() => {
    const audio = new Audio("/sounds/ufo.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const windy = useMemo(() => {
    const audio = new Audio("/sounds/windy.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const magnet = useMemo(() => {
    const audio = new Audio("/sounds/magnet.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  const bomb = useMemo(() => {
    const audio = new Audio("/sounds/bomb.wav");
    audio.preload = "auto";
    return audio;
  }, []);

  useEffect(() => {
    localStorage.setItem("audioMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("audioVolume", JSON.stringify(volume));
  }, [volume]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(100, v)));
  }, []);

  const volumeFactor = volume / 100;

  const playPositive = useCallback(() => {
    if (!isMuted) {
      positive.volume = volumeFactor;
      positive.currentTime = 0;
      void positive.play().catch(() => {});
    }
  }, [isMuted, positive, volumeFactor]);

  const playNegative = useCallback(() => {
    if (!isMuted) {
      negative.volume = volumeFactor;
      negative.currentTime = 0;
      void negative.play().catch(() => {});
    }
  }, [isMuted, negative, volumeFactor]);

  const playReplay = useCallback(() => {
    if (!isMuted) {
      replay.volume = volumeFactor;
      replay.currentTime = 0;
      void replay.play().catch(() => {});
    }
  }, [isMuted, replay, volumeFactor]);

  const playClick = useCallback(() => {
    if (!isMuted) {
      click.volume = volumeFactor;
      click.currentTime = 0;
      void click.play().catch(() => {});
    }
  }, [click, isMuted, volumeFactor]);

  const playSlots = useCallback(() => {
    if (!isMuted) {
      slots.volume = volumeFactor;
      slots.currentTime = 0;
      void slots.play().catch(() => {});
    }
  }, [isMuted, slots, volumeFactor]);

  const playReroll = useCallback(() => {
    if (!isMuted) {
      reroll.volume = volumeFactor;
      reroll.currentTime = 0;
      void reroll.play().catch(() => {});
    }
  }, [isMuted, reroll, volumeFactor]);

  const playUfo = useCallback(() => {
    if (!isMuted) {
      ufo.volume = volumeFactor;
      ufo.currentTime = 0;
      void ufo.play().catch(() => {});
    }
  }, [isMuted, ufo, volumeFactor]);

  const playWindy = useCallback(() => {
    if (!isMuted) {
      windy.volume = volumeFactor;
      windy.currentTime = 0;
      void windy.play().catch(() => {});
    }
  }, [isMuted, windy, volumeFactor]);

  const playMagnet = useCallback(() => {
    if (!isMuted) {
      magnet.volume = volumeFactor;
      magnet.currentTime = 0;
      void magnet.play().catch(() => {});
    }
  }, [isMuted, magnet, volumeFactor]);

  const playBomb = useCallback(() => {
    if (!isMuted) {
      bomb.volume = volumeFactor;
      bomb.currentTime = 0;
      void bomb.play().catch(() => {});
    }
  }, [isMuted, bomb, volumeFactor]);

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        toggleMute,
        volume,
        setVolume,
        playPositive,
        playNegative,
        playReplay,
        playClick,
        playSlots,
        playReroll,
        playUfo,
        playWindy,
        playMagnet,
        playBomb,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
