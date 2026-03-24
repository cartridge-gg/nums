import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import {
  ShadowEffect,
  ReferralIcon,
  LaurelIcon,
  StakingIcon,
  LightbulbIcon,
  TrophyIcon,
  QuestIcon,
  GithubIcon,
  DiscordIcon,
  XIcon,
  BookIcon,
} from "@/components/icons";
import { Sound, Close } from "@/components/elements";
import { Link } from "@/lib/router";
import { useId } from "react";

export interface SettingsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof settingsVariants> {
  onClose: () => void;
  musicVolume: number;
  musicMuted: boolean;
  onMusicChange: (value: number) => void;
  onMusicMute: () => void;
  sfxVolume: number;
  sfxMuted: boolean;
  onSfxChange: (value: number) => void;
  onSfxMute: () => void;
  onLeaderboard: () => void;
  onReferrals: () => void;
  onAchievements: () => void;
  onQuests: () => void;
  onStaking: () => void;
  onTutorial: () => void;
  onLogOut: () => void;
}

const settingsVariants = cva(
  "select-none relative flex flex-col p-6 md:p-12 gap-6 md:gap-10 h-full w-full md:h-auto",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl md:rounded-3xl bg-black-300 border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Settings = ({
  onClose,
  musicVolume,
  musicMuted,
  onMusicChange,
  onMusicMute,
  sfxVolume,
  sfxMuted,
  onSfxChange,
  onSfxMute,
  onLeaderboard,
  onReferrals,
  onAchievements,
  onQuests,
  onStaking,
  onTutorial,
  onLogOut,
  variant,
  className,
  ...props
}: SettingsProps) => {
  const filterId = useId();

  return (
    <div className={cn(settingsVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />

      {/* Mobile header */}
      <div className="flex items-center justify-between md:hidden">
        <h2
          className="text-[36px]/6 uppercase tracking-wider translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Settings
        </h2>
        <Close size="md" onClick={onClose} />
      </div>

      {/* Desktop header */}
      <Close
        size="lg"
        onClick={onClose}
        className="hidden md:flex absolute z-10 top-6 right-6"
      />
      <h2
        className="hidden md:block text-[48px]/[33px] uppercase tracking-wider translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Settings
      </h2>

      {/* Mobile content */}
      <div className="flex flex-col gap-6 h-full overflow-hidden md:hidden">
        <Volumes
          musicVolume={musicVolume}
          musicMuted={musicMuted}
          onMusicChange={onMusicChange}
          onMusicMute={onMusicMute}
          sfxVolume={sfxVolume}
          sfxMuted={sfxMuted}
          onSfxChange={onSfxChange}
          onSfxMute={onSfxMute}
        />
        <div className="flex flex-col gap-6 flex-1 justify-between overflow-hidden">
          <div
            className="flex flex-col gap-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <NavButtons
              filterId={filterId}
              onReferrals={onReferrals}
              onAchievements={onAchievements}
              onQuests={onQuests}
              onLeaderboard={onLeaderboard}
              onStaking={onStaking}
              onTutorial={onTutorial}
            />
            <LogOutButton onLogOut={onLogOut} />
          </div>
          <Socials />
        </div>
      </div>

      {/* Desktop content */}
      <div className="hidden md:flex gap-8 flex-1">
        <div className="flex flex-col gap-4 flex-1">
          <NavButtons
            filterId={filterId}
            onReferrals={onReferrals}
            onAchievements={onAchievements}
            onQuests={onQuests}
            onLeaderboard={onLeaderboard}
            onStaking={onStaking}
            onTutorial={onTutorial}
          />
        </div>
        <div className="flex flex-col justify-between gap-4 flex-1">
          <Volumes
            musicVolume={musicVolume}
            musicMuted={musicMuted}
            onMusicChange={onMusicChange}
            onMusicMute={onMusicMute}
            sfxVolume={sfxVolume}
            sfxMuted={sfxMuted}
            onSfxChange={onSfxChange}
            onSfxMute={onSfxMute}
          />
          <div className="flex flex-col gap-4">
            <LogOutButton onLogOut={onLogOut} />
            <Socials />
          </div>
        </div>
      </div>
    </div>
  );
};

const Volumes = ({
  musicVolume,
  musicMuted,
  onMusicChange,
  onMusicMute,
  sfxVolume,
  sfxMuted,
  onSfxChange,
  onSfxMute,
}: {
  musicVolume: number;
  musicMuted: boolean;
  onMusicChange: (value: number) => void;
  onMusicMute: () => void;
  sfxVolume: number;
  sfxMuted: boolean;
  onSfxChange: (value: number) => void;
  onSfxMute: () => void;
}) => (
  <div className="flex flex-col gap-6">
    <Sound
      title="Music Volume"
      value={musicVolume}
      muted={musicMuted}
      onChange={onMusicChange}
      onMute={onMusicMute}
    />
    <Sound
      title="SFX Volume"
      value={sfxVolume}
      muted={sfxMuted}
      onChange={onSfxChange}
      onMute={onSfxMute}
    />
  </div>
);

const NavButtons = ({
  filterId,
  onReferrals,
  onAchievements,
  onQuests,
  onLeaderboard,
  onStaking,
  onTutorial,
}: {
  filterId: string;
  onReferrals: () => void;
  onAchievements: () => void;
  onQuests: () => void;
  onLeaderboard: () => void;
  onStaking: () => void;
  onTutorial: () => void;
}) => (
  <>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onReferrals}
    >
      <ReferralIcon size="md" style={{ filter: `url(#${filterId})` }} />
      <span
        className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Referrals
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onAchievements}
    >
      <LaurelIcon size="md" style={{ filter: `url(#${filterId})` }} />
      <span
        className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Achievements
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onQuests}
    >
      <QuestIcon size="md" style={{ filter: `url(#${filterId})` }} />
      <span
        className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Quests
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onLeaderboard}
    >
      <TrophyIcon
        variant="solid"
        size="lg"
        style={{ filter: `url(#${filterId})` }}
      />
      <span
        className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Leaderboard
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onStaking}
    >
      <StakingIcon size="md" style={{ filter: `url(#${filterId})` }} />
      <span
        className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Staking
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onTutorial}
    >
      <LightbulbIcon size="md" style={{ filter: `url(#${filterId})` }} />
      <span
        className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        Tutorial
      </span>
    </Button>
  </>
);

const LogOutButton = ({ onLogOut }: { onLogOut: () => void }) => (
  <Button variant="destructive" className="h-10 min-h-10" onClick={onLogOut}>
    <span
      className="px-1 text-[22px]/[15px] tracking-wide translate-y-0.5"
      style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
    >
      Log Out
    </span>
  </Button>
);

const Socials = () => (
  <div className="flex gap-4 w-full">
    <Link
      to="https://nums-docs.preview.cartridge.gg/"
      target="_blank"
      className="flex-1 bg-mauve-800 hover:bg-mauve-700 cursor-pointer rounded-lg p-2 text-white-100 flex items-center justify-center"
    >
      <BookIcon size="md" />
    </Link>
    <Link
      to="https://github.com/cartridge-gg/nums"
      target="_blank"
      className="flex-1 bg-mauve-800 hover:bg-mauve-700 cursor-pointer rounded-lg p-2 text-white-100 flex items-center justify-center"
    >
      <GithubIcon size="md" />
    </Link>
    <Link
      to="https://discord.gg/rJGVUWQc25"
      target="_blank"
      className="flex-1 bg-mauve-800 hover:bg-mauve-700 cursor-pointer rounded-lg p-2 text-white-100 flex items-center justify-center"
    >
      <DiscordIcon size="md" />
    </Link>
    <Link
      to="https://x.com/numsgg"
      target="_blank"
      className="flex-1 bg-mauve-800 hover:bg-mauve-700 cursor-pointer rounded-lg p-2 text-white-100 flex items-center justify-center"
    >
      <XIcon size="md" />
    </Link>
  </div>
);
