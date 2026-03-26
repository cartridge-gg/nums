import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useQuests } from "@/context/quests";
import { useAchievements } from "@/context/achievements";
import type { Referral } from "@/hooks/referral";

export interface Notifications {
  hasQuestNotification: boolean;
  hasAchievementNotification: boolean;
  hasSettingsNotification: boolean;
  newQuestIds: Set<string>;
  newAchievementIds: Set<string>;
  newReferralCount: number;
  clearQuestNotifications: () => void;
  clearAchievementNotifications: () => void;
  clearReferralNotifications: () => void;
}

export function useNotifications(
  referralData: Referral[] | undefined,
): Notifications {
  const { address } = useAccount();
  const { completeds: questCompleteds, status: questStatus } = useQuests();
  const { completeds: achievementCompleteds, status: achievementStatus } =
    useAchievements();

  const [missionsInitialized, setMissionsInitialized] = useState(false);
  const [referralsInitialized, setReferralsInitialized] = useState(false);

  const [acknowledgedQuestIds, setAcknowledgedQuestIds] = useState<Set<string>>(
    new Set(),
  );
  const [acknowledgedAchievementIds, setAcknowledgedAchievementIds] = useState<
    Set<string>
  >(new Set());
  const [acknowledgedReferralCount, setAcknowledgedReferralCount] =
    useState<number>(0);

  const prevAddressRef = useRef(address);
  useEffect(() => {
    if (prevAddressRef.current === address) return;
    prevAddressRef.current = address;
    setMissionsInitialized(false);
    setReferralsInitialized(false);
    setAcknowledgedQuestIds(new Set());
    setAcknowledgedAchievementIds(new Set());
    setAcknowledgedReferralCount(0);
  }, [address]);

  useEffect(() => {
    if (missionsInitialized) return;
    if (questStatus !== "success" || achievementStatus !== "success") return;

    const questIds = new Set<string>();
    questCompleteds.forEach(({ event }) => {
      if (BigInt(event.player_id) === BigInt(address || "0x0")) {
        questIds.add(event.quest_id);
      }
    });
    setAcknowledgedQuestIds(questIds);

    const achievementIds = new Set<string>();
    achievementCompleteds.forEach(({ event }) => {
      if (BigInt(event.player_id) === BigInt(address || "0x0")) {
        achievementIds.add(event.achievement_id);
      }
    });
    setAcknowledgedAchievementIds(achievementIds);

    setMissionsInitialized(true);
  }, [
    missionsInitialized,
    questStatus,
    achievementStatus,
    questCompleteds,
    achievementCompleteds,
    address,
  ]);

  useEffect(() => {
    if (referralsInitialized) return;
    if (referralData === undefined) return;

    setAcknowledgedReferralCount(referralData.length);
    setReferralsInitialized(true);
  }, [referralsInitialized, referralData]);

  const newQuestIds = useMemo(() => {
    if (!missionsInitialized) return new Set<string>();
    const ids = new Set<string>();
    questCompleteds.forEach(({ event }) => {
      if (event.hasExpired()) return;
      if (BigInt(event.player_id) !== BigInt(address || "0x0")) return;
      if (!acknowledgedQuestIds.has(event.quest_id)) {
        ids.add(event.quest_id);
      }
    });
    return ids;
  }, [missionsInitialized, questCompleteds, address, acknowledgedQuestIds]);

  const newAchievementIds = useMemo(() => {
    if (!missionsInitialized) return new Set<string>();
    const ids = new Set<string>();
    achievementCompleteds.forEach(({ event }) => {
      if (event.hasExpired()) return;
      if (BigInt(event.player_id) !== BigInt(address || "0x0")) return;
      if (!acknowledgedAchievementIds.has(event.achievement_id)) {
        ids.add(event.achievement_id);
      }
    });
    return ids;
  }, [
    missionsInitialized,
    achievementCompleteds,
    address,
    acknowledgedAchievementIds,
  ]);

  const newReferralCount = useMemo(() => {
    if (!referralsInitialized) return 0;
    const total = referralData?.length ?? 0;
    return Math.max(0, total - acknowledgedReferralCount);
  }, [referralsInitialized, referralData, acknowledgedReferralCount]);

  const hasQuestNotification = newQuestIds.size > 0;
  const hasAchievementNotification = newAchievementIds.size > 0;
  const hasSettingsNotification = newReferralCount > 0;

  const clearQuestNotifications = useCallback(() => {
    setAcknowledgedQuestIds((prev) => {
      const next = new Set(prev);
      for (const id of newQuestIds) {
        next.add(id);
      }
      return next;
    });
  }, [newQuestIds]);

  const clearAchievementNotifications = useCallback(() => {
    setAcknowledgedAchievementIds((prev) => {
      const next = new Set(prev);
      for (const id of newAchievementIds) {
        next.add(id);
      }
      return next;
    });
  }, [newAchievementIds]);

  const clearReferralNotifications = useCallback(() => {
    setAcknowledgedReferralCount(referralData?.length ?? 0);
  }, [referralData]);

  return {
    hasQuestNotification,
    hasAchievementNotification,
    hasSettingsNotification,
    newQuestIds,
    newAchievementIds,
    newReferralCount,
    clearQuestNotifications,
    clearAchievementNotifications,
    clearReferralNotifications,
  };
}
