import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useEntities } from "@/context/entities";
import { Toast } from "@/components/elements";
import { useControllers } from "@/context/controllers";
import type { Controller } from "@dojoengine/torii-wasm";
import { useMediaQuery } from "usehooks-ts";
import { useAccount } from "@starknet-react/core";
import {
  AchievementCompleted,
  Claimed,
  Purchased,
  QuestCompleted,
  QuestClaimed,
  Started,
} from "@/models";
import { useQuests } from "@/context/quests";
import { useAchievements } from "@/context/achievements";
import { useAudio } from "@/context/audio";
import { shortAddress } from "@/helpers";

const getUsername = (result: Controller | undefined, player: string) => {
  const address = `0x${BigInt(player).toString(16)}`;
  return result?.username || shortAddress(address);
};

/**
 * Hook to display toast notifications for social events (Started, Purchased, Claimed)
 * Tracks already-toasted events to avoid duplicates
 */
export const useToasters = () => {
  const { address } = useAccount();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { find, loading } = useControllers();
  const { started, claimed, purchased } = useEntities();
  const { completeds: questCompleteds, claimeds } = useQuests();
  const { completeds } = useAchievements();
  const { playReplay } = useAudio();
  const toastedRef = useRef<Set<string>>(new Set());

  // Handle Started events
  useEffect(() => {
    if (!started || isMobile || loading) return;
    if (BigInt(started.player_id) === BigInt(address || "0x0")) return;

    // Skip if already toasted
    const id = Started.getId(started);
    if (toastedRef.current.has(id)) return;
    // Mark as toasted
    toastedRef.current.add(id);

    // Emit toast to social toaster
    toast(
      <Toast
        titleProps={{
          title: getUsername(find(started.player_id), started.player_id),
        }}
        descriptionProps={{
          multiplier: started.multiplier,
        }}
        actionProps={{
          to: `/game/${started.game_id}`,
        }}
      />,
      {
        position: "top-left",
      },
    );
  }, [address, isMobile, started, loading, find, toastedRef]);

  useEffect(() => {
    if (!claimed || isMobile || loading) return;
    if (BigInt(claimed.player_id) === BigInt(address || "0x0")) return;

    // Skip if already toasted
    const id = Claimed.getId(claimed);
    if (toastedRef.current.has(id)) return;
    // Mark as toasted
    toastedRef.current.add(id);

    // Emit toast to social toaster
    toast(
      <Toast
        titleProps={{
          title: getUsername(find(claimed.player_id), claimed.player_id),
        }}
        descriptionProps={{
          earning: claimed.reward,
        }}
        actionProps={{
          to: `/game/${claimed.game_id}`,
        }}
      />,
      {
        position: "top-left",
      },
    );
  }, [address, isMobile, claimed, loading, find, toastedRef]);

  // Handle Purchased events
  useEffect(() => {
    if (!purchased || loading) return;
    if (BigInt(purchased.player_id) !== BigInt(address || "0x0")) return;

    // Skip if already toasted
    const id = Purchased.getId(purchased);
    if (toastedRef.current.has(id)) return;
    // Mark as toasted
    toastedRef.current.add(id);

    // Emit toast to player toaster
    toast(
      <Toast
        titleProps={{
          title: "Purchase Complete",
        }}
        descriptionProps={{
          reward: "Nums Game(s)",
        }}
        thumbnailProps={{
          type: "purchase",
        }}
      />,
      {
        position: isMobile ? "top-center" : "top-right",
      },
    );
  }, [address, purchased, loading, find, toastedRef]);

  useEffect(() => {
    if (!questCompleteds || loading) return;

    questCompleteds.forEach(({ event, quest }) => {
      if (BigInt(event.player_id) !== BigInt(address || "0x0")) return;

      const id = QuestCompleted.getId(event);
      if (toastedRef.current.has(id)) return;
      toastedRef.current.add(id);

      playReplay();

      toast(
        <Toast
          titleProps={{
            title: quest.metadata.name,
          }}
          descriptionProps={{
            reward: "Quest Completed",
          }}
          thumbnailProps={{
            type: "quest",
          }}
        />,
        {
          position: isMobile ? "top-center" : "top-right",
        },
      );
    });
  }, [address, questCompleteds, loading, find, playReplay, toastedRef]);

  useEffect(() => {
    if (!claimeds || loading) return;

    claimeds.forEach(({ event, quest }) => {
      if (BigInt(event.player_id) !== BigInt(address || "0x0")) return;

      // Skip if already toasted
      const id = QuestClaimed.getId(event);
      if (toastedRef.current.has(id)) return;
      // Mark as toasted
      toastedRef.current.add(id);

      playReplay();

      // Emit toast to player toaster
      toast(
        <Toast
          titleProps={{
            title: quest.metadata.name,
          }}
          descriptionProps={{
            reward: quest.metadata.rewards[0]?.description || "",
          }}
          thumbnailProps={{
            type: "quest",
          }}
        />,
        {
          position: isMobile ? "top-center" : "top-right",
        },
      );
    });
  }, [address, claimeds, loading, find, playReplay, toastedRef]);

  // Handle Achievement Completed events
  useEffect(() => {
    if (!completeds || loading) return;

    completeds.forEach(({ event, achievement }) => {
      if (BigInt(event.player_id) !== BigInt(address || "0x0")) return;

      // Skip if already toasted
      const id = AchievementCompleted.getId(event);
      if (toastedRef.current.has(id)) return;
      // Mark as toasted
      toastedRef.current.add(id);

      playReplay();

      // Emit toast to player toaster
      toast(
        <Toast
          titleProps={{
            title: achievement.title,
          }}
          descriptionProps={{
            points: achievement.points,
          }}
          thumbnailProps={{
            type: "achievement",
          }}
        />,
        {
          position: isMobile ? "top-center" : "top-right",
        },
      );
    });
  }, [address, completeds, loading, find, playReplay, toastedRef]);
};
