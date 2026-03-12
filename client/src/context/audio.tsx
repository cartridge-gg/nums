import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

const AudioCtx = createContext<AudioContextType>({
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

export const useAudio = () => useContext(AudioCtx);

const SFX_PATHS = {
  positive: "/sounds/esm_positive.wav",
  negative: "/sounds/esm_negative.wav",
  replay: "/sounds/esm_replay.wav",
  click: "/sounds/click.wav",
  slots: "/sounds/slots.wav",
  reroll: "/sounds/reroll.wav",
  ufo: "/sounds/ufo.wav",
  windy: "/sounds/windy.wav",
  magnet: "/sounds/magnet.wav",
  bomb: "/sounds/bomb.wav",
} as const;

type SfxName = keyof typeof SFX_PATHS;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("audioMuted");
    return saved ? JSON.parse(saved) : false;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem("audioVolume");
    return saved ? Number(JSON.parse(saved)) : 100;
  });

  const ctxRef = useRef<globalThis.AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<SfxName, AudioBuffer>>(new Map());

  // Lazily create or resume the AudioContext
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

  // Pre-fetch and decode all SFX buffers
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { ctx } = getCtx();
      await Promise.all(
        (Object.entries(SFX_PATHS) as [SfxName, string][]).map(
          async ([name, path]) => {
            try {
              const res = await fetch(path);
              const arrayBuf = await res.arrayBuffer();
              const audioBuf = await ctx.decodeAudioData(arrayBuf);
              if (!cancelled) buffersRef.current.set(name, audioBuf);
            } catch {
              // Silently ignore load failures for SFX
            }
          },
        ),
      );
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getCtx]);

  // Update gain when volume changes
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("audioMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("audioVolume", JSON.stringify(volume));
  }, [volume]);

  const playSfx = useCallback(
    (name: SfxName) => {
      if (isMuted) return;
      const buffer = buffersRef.current.get(name);
      if (!buffer) return;
      const { ctx, gain } = getCtx();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.start(0);
    },
    [isMuted, getCtx],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(100, v)));
  }, []);

  const playPositive = useCallback(() => playSfx("positive"), [playSfx]);
  const playNegative = useCallback(() => playSfx("negative"), [playSfx]);
  const playReplay = useCallback(() => playSfx("replay"), [playSfx]);
  const playClick = useCallback(() => playSfx("click"), [playSfx]);
  const playSlots = useCallback(() => playSfx("slots"), [playSfx]);
  const playReroll = useCallback(() => playSfx("reroll"), [playSfx]);
  const playUfo = useCallback(() => playSfx("ufo"), [playSfx]);
  const playWindy = useCallback(() => playSfx("windy"), [playSfx]);
  const playMagnet = useCallback(() => playSfx("magnet"), [playSfx]);
  const playBomb = useCallback(() => playSfx("bomb"), [playSfx]);

  return (
    <AudioCtx.Provider
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
    </AudioCtx.Provider>
  );
}
