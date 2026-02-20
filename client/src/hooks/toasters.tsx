import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useEntities } from "@/context/entities";
import { Toast } from "@/components/elements";
import { useControllers } from "@/context/controllers";
import { getChecksumAddress } from "starknet";
import { Controller } from "@dojoengine/torii-wasm";
import { useMediaQuery } from "usehooks-ts";
import { useAccount } from "@starknet-react/core";
import { Claimed, Purchased, QuestClaimed, Started } from "@/models";
import { useQuests } from "@/context/quests";

const getUsername = (result: Controller | undefined, player: string) => {
  const address = getChecksumAddress(player);
  return result?.username || address.slice(0, 6) + "..." + address.slice(-4);
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
  const { claimeds } = useQuests();
  const toastedRef = useRef<Set<string>>(new Set());

  // Handle Started events
  useEffect(() => {
    if (!started || isMobile || loading) return;
    if (BigInt(started.player_id) === BigInt(address || "0x0")) return;

    // Skip if already toasted
    let id = Started.getId(started);
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
          to: `/game?id=${started.game_id}`,
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
    let id = Claimed.getId(claimed);
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
          to: `/game?id=${claimed.game_id}`,
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
    let id = Purchased.getId(purchased);
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

  // Handle Quest Claimed events
  useEffect(() => {
    if (!claimeds || loading) return;

    claimeds.forEach(({ event, quest }) => {
      if (BigInt(event.player_id) !== BigInt(address || "0x0")) return;

      // Skip if already toasted
      let id = QuestClaimed.getId(event);
      if (toastedRef.current.has(id)) return;
      // Mark as toasted
      toastedRef.current.add(id);

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
  }, [address, claimeds, loading, find, toastedRef]);
};
