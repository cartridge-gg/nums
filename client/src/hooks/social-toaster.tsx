import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useEntities } from "@/context/entities";
import { ToastAction, ToastDescription, ToastTitle } from "@/components/elements";
import { Started, Claimed } from "@/models";
import { useControllers } from "@/context/controllers";
import { getChecksumAddress } from "starknet";
import { Controller } from "@dojoengine/torii-wasm";

const getUsername = (result: Controller | undefined, player: string) => {
  const address = getChecksumAddress(player);
  return result?.username || address.slice(0, 6) + "..." + address.slice(-4);
};

/**
 * Hook to display toast notifications for social events (Started, Purchased, Claimed)
 * Tracks already-toasted events to avoid duplicates
 */
export const useSocialToaster = () => {
  const { find } = useControllers();
  const { starteds, purchaseds: _purchaseds, claimeds } = useEntities();
  const toastedRef = useRef<Set<string>>(new Set());

  // Handle Started events
  useEffect(() => {
    if (!starteds || starteds.length === 0) return;

    starteds.forEach((event) => {
      const id = Started.getId(event);
      
      // Skip if already toasted
      if (toastedRef.current.has(id)) return;

      // Mark as toasted
      toastedRef.current.add(id);

      // Emit toast
      toast(
        <ToastTitle
          title={getUsername(find(event.player_id), event.player_id)}
        />,
        {
          description: <ToastDescription multiplier={event.multiplier} />,
          action: <ToastAction to={`/game?id=${event.game_id}`} />,
        },
      );
    });
  }, [starteds, find]);

  // TODO: Handle Purchased events
  // useEffect(() => {
  //   if (!purchaseds || purchaseds.length === 0) return;
  //   // Implementation for Purchased events
  // }, [purchaseds]);

  useEffect(() => {
    if (!claimeds || claimeds.length === 0) return;

    claimeds.forEach((event) => {
      const id = Claimed.getId(event);
      
      // Skip if already toasted
      if (toastedRef.current.has(id)) return;

      // Mark as toasted
      toastedRef.current.add(id);

      // Emit toast
      toast(
        <ToastTitle
          title={getUsername(find(event.player_id), event.player_id)}
        />,
        {
          description: <ToastDescription earnings={event.reward} />,
          action: <ToastAction to={`/game?id=${event.game_id}`} />,
        },
      );
    });
  }, [claimeds]);
};
