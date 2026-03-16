import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PLAYLIST = [
  "/musics/nums_level_theme.mp3",
  "/musics/nums_game_theme.mp3",
];

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  volume: 100,
  setVolume: () => {},
});

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("soundMuted");
    return saved ? JSON.parse(saved) : false;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem("soundVolume");
    return saved ? Number(JSON.parse(saved)) : 100;
  });

  const ctxRef = useRef<globalThis.AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const buffersRef = useRef<AudioBuffer[]>([]);
  const currentTrackRef = useRef(0);
  const loadedRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new globalThis.AudioContext();
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return { ctx: ctxRef.current, gain: gainRef.current! };
  }, []);

  // Decode a single track on demand
  const loadTrack = useCallback(
    async (index: number): Promise<AudioBuffer | null> => {
      if (buffersRef.current[index]) return buffersRef.current[index];
      try {
        const { ctx } = getCtx();
        const res = await fetch(PLAYLIST[index]);
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        buffersRef.current[index] = audioBuf;
        return audioBuf;
      } catch {
        return null;
      }
    },
    [getCtx],
  );

  const stopCurrent = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.onended = null;
        sourceRef.current.stop();
      } catch {
        // already stopped
      }
      sourceRef.current = null;
    }
  }, []);

  const playTrack = useCallback(
    async (index: number) => {
      stopCurrent();
      const buffer = await loadTrack(index);
      if (!buffer) return;
      const { ctx, gain } = getCtx();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.onended = () => {
        const next = (index + 1) % PLAYLIST.length;
        currentTrackRef.current = next;
        void playTrack(next);
      };
      source.start(0);
      sourceRef.current = source;
    },
    [getCtx, loadTrack, stopCurrent],
  );

  // Start playback on first user interaction
  useEffect(() => {
    const startPlayback = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      currentTrackRef.current = Math.floor(Math.random() * PLAYLIST.length);
      if (!isMuted) {
        void playTrack(currentTrackRef.current);
      }
    };

    document.addEventListener("click", startPlayback, { once: true });
    document.addEventListener("keydown", startPlayback, { once: true });
    document.addEventListener("touchstart", startPlayback, { once: true });

    return () => {
      document.removeEventListener("click", startPlayback);
      document.removeEventListener("keydown", startPlayback);
      document.removeEventListener("touchstart", startPlayback);
    };
  }, [isMuted, playTrack]);

  useEffect(() => {
    if (!gainRef.current) return;
    if (isMuted) {
      gainRef.current.gain.value = 0;
    } else {
      gainRef.current.gain.value = volume / 100;
      if (loadedRef.current && !sourceRef.current) {
        void playTrack(currentTrackRef.current);
      }
    }
  }, [isMuted, volume, playTrack]);

  useEffect(() => {
    localStorage.setItem("soundMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("soundVolume", JSON.stringify(volume));
  }, [volume]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(100, v)));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrent();
      if (ctxRef.current) {
        void ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, [stopCurrent]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
}
