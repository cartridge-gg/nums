import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@starknet-react/core";
import { queryKeys } from "@/api/keys";
import { MaxShare } from "@/api/torii/max-share";
import { useActions } from "@/hooks/actions";
import { useCalls } from "@/hooks/calls";
import { useVault } from "@/context/vault";
import { getVaultAddress } from "@/config";

const USDC_DECIMALS = 10n ** 6n;
const DEBOUNCE_DELAY = 500;

export interface UseStakingParams {
  balance: number;
  shares: number;
  totalShares: bigint;
  totalAssets: bigint;
  numsPrice: number;
}

export const useStaking = ({
  balance,
  shares,
  totalShares,
  totalAssets,
  numsPrice,
}: UseStakingParams) => {
  const { vault } = useActions();
  const calls = useCalls();
  const { vaultInfo, vaultPosition } = useVault();
  const { chain } = useNetwork();
  const vaultAddress = getVaultAddress(chain.id);
  const toChainAmount = useCallback((value: number): bigint => {
    if (!Number.isFinite(value) || value < 0) return 0n;
    const fixed = value.toFixed(18);
    const [integer, fraction = ""] = fixed.split(".");
    const paddedFraction = fraction.slice(0, 18).padEnd(18, "0");
    return BigInt(integer) * 10n ** 18n + BigInt(paddedFraction);
  }, []);
  const fromChainAmount = useCallback((value: bigint): number => {
    const integer = value / 10n ** 18n;
    const fraction = value % 10n ** 18n;
    return Number(integer) + Number(fraction) / Number(10n ** 18n);
  }, []);

  const { data: maxShare = 0, refetch: refetchMaxShareQuery } = useQuery({
    queryKey: queryKeys.vault.maxShare(vaultAddress),
    queryFn: () => MaxShare.fetch(vaultAddress),
    enabled: false,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Stake tab: deposit NUMS (top) → mint vNUMS (bottom)
  const [depositValue, setDepositValue] = useState(0);
  const [mintValue, setMintValue] = useState(0);
  const [depositLoading, setDepositLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);

  // Unstake tab: redeem vNUMS (top) → withdraw NUMS (bottom)
  const [redeemValue, setRedeemValue] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const mintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const depositTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const redeemTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const withdrawTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const numsBalance = useMemo(() => balance || 0, [balance]);
  const vNumsBalance = useMemo(() => shares || 0, [shares]);

  // Ratio: 1 NUMS = ? vNUMS (local estimate from vault totals for the badge display)
  const ratio = useMemo(() => {
    if (totalAssets === 0n || totalShares === 0n) return undefined;
    return Number((10n ** 18n * totalShares) / totalAssets) / 10 ** 18;
  }, [totalAssets, totalShares]);

  // Claimable reward: mirrors rewardable::claimable on-chain
  // result of vaultPosition.claimable() is in USDC raw units (6 decimals)
  const { claimableAmount, totalAmount } = useMemo(() => {
    if (!vaultPosition || !vaultInfo)
      return { claimableAmount: 0, totalAmount: 0 };
    const vNumsSharesBigInt = toChainAmount(vNumsBalance);
    const amount = vaultPosition.claimable(
      vNumsSharesBigInt,
      vaultInfo.total_reward,
    );
    const total = vaultPosition.claimable(totalShares, vaultInfo.total_reward);
    const decimals = Number(USDC_DECIMALS);
    return {
      claimableAmount: Number(amount) / decimals,
      totalAmount: Number(total) / decimals,
    };
  }, [vaultPosition, vaultInfo, vNumsBalance, totalShares, toChainAmount]);

  // Yield APR: placeholder until on-chain data is available
  const yieldValue = useMemo((): number | undefined => undefined, []);

  const handleDepositChange = useCallback(
    (value: number) => {
      setDepositValue(value);
      setMintLoading(true);
      clearTimeout(mintTimer.current);
      mintTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewDeposit(toChainAmount(value));
          setMintValue(fromChainAmount(result));
        } finally {
          setMintLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls, fromChainAmount, toChainAmount],
  );

  const handleMintChange = useCallback(
    (value: number) => {
      setMintValue(value);
      setDepositLoading(true);
      clearTimeout(depositTimer.current);
      depositTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewMint(toChainAmount(value));
          setDepositValue(fromChainAmount(result));
        } finally {
          setDepositLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls, fromChainAmount, toChainAmount],
  );

  const handleRedeemChange = useCallback(
    (value: number) => {
      setRedeemValue(value);
      setWithdrawLoading(true);
      clearTimeout(withdrawTimer.current);
      withdrawTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewRedeem(toChainAmount(value));
          setWithdrawValue(fromChainAmount(result));
        } finally {
          setWithdrawLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls, fromChainAmount, toChainAmount],
  );

  const handleWithdrawChange = useCallback(
    (value: number) => {
      setWithdrawValue(value);
      setRedeemLoading(true);
      clearTimeout(redeemTimer.current);
      redeemTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewWithdraw(toChainAmount(value));
          setRedeemValue(fromChainAmount(result));
        } finally {
          setRedeemLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls, fromChainAmount, toChainAmount],
  );

  const handleStake = useCallback(async () => {
    if (depositValue > 0) {
      await vault.deposit(toChainAmount(depositValue));
      setDepositValue(0);
      setMintValue(0);
    }
  }, [vault, depositValue, toChainAmount]);

  const handleUnstake = useCallback(async () => {
    if (redeemValue > 0) {
      await vault.redeem(toChainAmount(redeemValue));
      setRedeemValue(0);
      setWithdrawValue(0);
    }
  }, [vault, redeemValue, toChainAmount]);

  const refetch = useCallback(() => {
    refetchMaxShareQuery();
  }, [refetchMaxShareQuery]);

  return useMemo(
    () => ({
      refetch,
      stakingProps: {
        depositProps: {
          balance: numsBalance,
          numsPrice,
          value: depositValue,
          onValueChange: handleDepositChange,
          loading: depositLoading,
        },
        mintProps: {
          balance: vNumsBalance,
          value: mintValue,
          onValueChange: handleMintChange,
          loading: mintLoading,
        },
        withdrawProps: {
          balance: vNumsBalance,
          value: redeemValue,
          onValueChange: handleRedeemChange,
          loading: redeemLoading,
        },
        redeemProps: {
          balance: numsBalance,
          numsPrice,
          value: withdrawValue,
          onValueChange: handleWithdrawChange,
          loading: withdrawLoading,
        },
        onStake: handleStake,
        onUnstake: handleUnstake,
      },
      balanceProps: {
        stakedAmount: vNumsBalance,
        totalShare: fromChainAmount(totalShares),
      },
      rewardProps: {
        rewardAmount: claimableAmount,
        onClaim: claimableAmount > 0 ? () => vault.claim() : undefined,
      },
      yieldProps: {
        value: yieldValue,
      },
      ratioProps: {
        value: ratio,
      },
      goalProps: {
        totalStaked: fromChainAmount(totalAssets) - maxShare,
        totalShares: maxShare,
      },
      vaultProps: {
        vaultAmount: totalAmount,
        usdcPrice: 1,
      },
      supplyProps: {
        totalShares: fromChainAmount(totalShares),
      },
    }),
    [
      numsBalance,
      vNumsBalance,
      numsPrice,
      depositValue,
      mintValue,
      redeemValue,
      withdrawValue,
      depositLoading,
      mintLoading,
      redeemLoading,
      withdrawLoading,
      ratio,
      yieldValue,
      claimableAmount,
      totalShares,
      totalAssets,
      fromChainAmount,
      vault,
      handleDepositChange,
      handleMintChange,
      handleRedeemChange,
      handleWithdrawChange,
      handleStake,
      handleUnstake,
    ],
  );
};
