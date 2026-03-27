import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShadowEffect, SoundOffIcon, SoundOnIcon } from "@/components/icons";
import { Slider } from "@/components/ui/slider";
import { useCallback, useId, useState } from "react";

export interface SoundProps {
  title: string;
  value?: number;
  muted?: boolean;
  onChange: (value: number) => void;
  onMute: () => void;
  className?: string;
}

export const Sound = ({
  title,
  value = 100,
  muted = false,
  onChange,
  onMute,
  className,
}: SoundProps) => {
  const filterId = useId();
  const [volume, setVolume] = useState(value);
  const [isMuted, setIsMuted] = useState(muted || value === 0);

  const handleChange = useCallback(
    (v: number) => {
      setVolume(v);
      if (v === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
      onChange(v);
    },
    [isMuted, onChange],
  );

  const handleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      onChange(0);
    } else {
      onChange(volume);
    }
    onMute();
  }, [isMuted, volume, onChange, onMute]);
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <span className="font-primary text-[18px] leading-[12px] text-primary-100 tracking-wider">
        {title}
      </span>
      <div className="flex items-center gap-6">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10"
          onClick={handleMute}
        >
          <ShadowEffect filterId={filterId} />
          {isMuted ? (
            <SoundOffIcon
              size="md"
              variant="solid"
              style={{ filter: `url(#${filterId})` }}
            />
          ) : (
            <SoundOnIcon
              size="md"
              variant="solid"
              style={{ filter: `url(#${filterId})` }}
            />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={([v]) => handleChange(v ?? 0)}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>
    </div>
  );
};
