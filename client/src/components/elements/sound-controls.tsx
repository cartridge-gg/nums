import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Sound } from "./sound";
import { ShadowEffect, SoundOffIcon, SoundOnIcon } from "@/components/icons";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/context/audio";
import { useSound } from "@/context/sound";
import { useId } from "react";

function VolumeSlider({
  label,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}: {
  label: string;
  volume: number;
  onVolumeChange: (v: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  const filterId = useId();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleMute}
        className="flex-shrink-0 p-1 rounded hover:bg-mauve-600 transition-colors"
        aria-label={isMuted ? `Unmute ${label}` : `Mute ${label}`}
      >
        <ShadowEffect filterId={filterId} />
        {isMuted ? (
          <SoundOffIcon
            size="md"
            variant="solid"
            className="size-5"
            style={{ filter: `url(#${filterId})` }}
          />
        ) : (
          <SoundOnIcon
            size="md"
            variant="solid"
            className="size-5"
            style={{ filter: `url(#${filterId})` }}
          />
        )}
      </button>
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-white-200 font-medium">{label}</span>
        <Slider
          value={[volume]}
          onValueChange={([v]) => onVolumeChange(v ?? 0)}
          min={0}
          max={100}
          step={1}
          disabled={isMuted}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function SoundControls({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isMuted: effectsMuted,
    toggleMute: toggleEffectsMute,
    volume: effectsVolume,
    setVolume: setEffectsVolume,
  } = useAudio();
  const {
    isMuted: musicMuted,
    toggleMute: toggleMusicMute,
    volume: musicVolume,
    setVolume: setMusicVolume,
  } = useSound();

  const isMuted = effectsMuted && musicMuted;

  const handleToggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Sound isMuted={isMuted} onClick={handleToggleOpen} />
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[200px] p-3 rounded-lg bg-mauve-200 border border-mauve-600 shadow-lg flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <VolumeSlider
            label="Music"
            volume={musicVolume}
            onVolumeChange={setMusicVolume}
            isMuted={musicMuted}
            onToggleMute={toggleMusicMute}
          />
          <VolumeSlider
            label="Effects"
            volume={effectsVolume}
            onVolumeChange={setEffectsVolume}
            isMuted={effectsMuted}
            onToggleMute={toggleEffectsMute}
          />
        </div>
      )}
    </div>
  );
}
