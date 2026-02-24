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

const PLAYLIST = [
  "/musics/xtremefreddy-game-music-loop-1.mp3",
  "/musics/xtremefreddy-game-music-loop-2.mp3",
  "/musics/xtremefreddy-game-music-loop-3.mp3",
  "/musics/xtremefreddy-game-music-loop-4.mp3",
  "/musics/xtremefreddy-game-music-loop-5.mp3",
  "/musics/xtremefreddy-game-music-loop-6.mp3",
  "/musics/xtremefreddy-game-music-loop-7.mp3",
  "/musics/xtremefreddy-game-music-loop-8.mp3",
  "/musics/xtremefreddy-game-music-loop-9.mp3",
  "/musics/xtremefreddy-game-music-loop-10.mp3",
  "/musics/xtremefreddy-game-music-loop-11.mp3",
  "/musics/xtremefreddy-game-music-loop-12.mp3",
  "/musics/xtremefreddy-game-music-loop-13.mp3",
  "/musics/xtremefreddy-game-music-loop-14.mp3",
  "/musics/xtremefreddy-game-music-loop-15.mp3",
  "/musics/xtremefreddy-game-music-loop-16.mp3",
  "/musics/xtremefreddy-game-music-loop-17.mp3",
  "/musics/xtremefreddy-game-music-loop-18.mp3",
  "/musics/xtremefreddy-game-music-loop-19.mp3",
  "/musics/xtremefreddy-game-music-loop-20.mp3",
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndexRef = useRef(0);
  const playlist = useMemo(() => PLAYLIST, []);

  const playTrack = useCallback(
    (trackIndex: number) => {
      if (isMuted || !playlist.length) return;

      const src = playlist[trackIndex];
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
      }

      const audio = audioRef.current;
      audio.src = src;
      audio.loop = playlist.length === 1;
      audio.volume = volume / 100;
      void audio.play().catch(() => {});
    },
    [isMuted, playlist, volume],
  );

  const playNextTrack = useCallback(() => {
    if (!playlist.length) return;
    const nextIndex = (currentTrackIndexRef.current + 1) % playlist.length;
    currentTrackIndexRef.current = nextIndex;
    playTrack(nextIndex);
  }, [playlist, playTrack]);

  const playNextTrackRef = useRef(playNextTrack);
  playNextTrackRef.current = playNextTrack;

  const playTrackRef = useRef(playTrack);
  playTrackRef.current = playTrack;

  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  // Initialize audio element and start playback (once)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      if (playlistRef.current.length > 1) {
        playNextTrackRef.current();
      }
    };

    audio.addEventListener("ended", handleEnded);

    // Start with random track
    currentTrackIndexRef.current =
      playlistRef.current.length > 0
        ? Math.floor(Math.random() * playlistRef.current.length)
        : 0;
    playTrackRef.current(currentTrackIndexRef.current);

    // Resume on first user interaction (browser autoplay policy)
    const resumeOnInteraction = () => {
      if (!audioRef.current || playlistRef.current.length === 0) return;
      playTrackRef.current(currentTrackIndexRef.current);
    };
    document.addEventListener("click", resumeOnInteraction, { once: true });
    document.addEventListener("keydown", resumeOnInteraction, { once: true });
    document.addEventListener("touchstart", resumeOnInteraction, {
      once: true,
    });

    return () => {
      audio.removeEventListener("ended", handleEnded);
      document.removeEventListener("click", resumeOnInteraction);
      document.removeEventListener("keydown", resumeOnInteraction);
      document.removeEventListener("touchstart", resumeOnInteraction);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Handle mute changes (pause/resume)
  useEffect(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.pause();
    } else {
      playTrackRef.current(currentTrackIndexRef.current);
    }
  }, [isMuted]);

  // Handle volume changes (only update volume, don't restart)
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

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

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
}
