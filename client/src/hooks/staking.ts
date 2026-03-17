import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";
import { useActions } from "@/hooks/actions";
import { useCalls } from "@/hooks/calls";
import { useVault } from "@/context/vault";
import { DEFAULT_CHAIN_ID, dojoConfigs, getVaultAddress } from "@/config";

const DECIMALS = 10n ** 18n;
const USDC_DECIMALS = 10n ** 6n;
const DEBOUNCE_DELAY = 500;

export interface UseStakingParams {
  balance: number;
  shares: number;
  totalShares: bigint;
  totalAssets: bigint;
  numsPrice: number;
}

const fetchMaxShare = async (vaultAddress: string): Promise<number> => {
  const url = `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;
  const contractAddress = getChecksumAddress(vaultAddress).toLowerCase();

  const sqlQuery = `SELECT MAX(balance)
FROM token_balances
WHERE contract_address = '${contractAddress}'
LIMIT 1000;`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: sqlQuery,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch max share: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  let data: unknown;
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }
  }

  let rows: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (
    data &&
    typeof data === "object" &&
    "rows" in data &&
    Array.isArray((data as { rows: unknown }).rows)
  ) {
    rows = (data as { rows: Record<string, unknown>[] }).rows;
  } else if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    rows = (data as { data: Record<string, unknown>[] }).data;
  }

  const raw = rows[0]?.["MAX(balance)"];
  if (!raw) return 0;
  const rawBalance = BigInt(String(raw));
  return Number(rawBalance) / Number(DECIMALS);
};

/** Convert a display number to on-chain bigint (18 decimals) */
const toBigInt = (value: number): bigint => {
  if (!Number.isFinite(value) || value < 0) return 0n;
  // toFixed(18) avoids scientific notation (e.g. 8e-17 → "0.000000000000000080")
  const fixed = value.toFixed(18);
  const [integer, fraction = ""] = fixed.split(".");
  const paddedFraction = fraction.slice(0, 18).padEnd(18, "0");
  return BigInt(integer) * DECIMALS + BigInt(paddedFraction);
};

/** Convert an on-chain bigint (18 decimals) to display number */
const toNumber = (value: bigint): number => {
  const integer = value / DECIMALS;
  const fraction = value % DECIMALS;
  return Number(integer) + Number(fraction) / Number(DECIMALS);
};

/** Local ERC4626 ratio estimate used only for the ratio display badge */
const estimateRatio = (
  totalAssets: bigint,
  totalShares: bigint,
): number | undefined => {
  if (totalAssets === 0n || totalShares === 0n) return undefined;
  return toNumber((DECIMALS * totalShares) / totalAssets);
};

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

  const { data: maxShare = 0 } = useQuery({
    queryKey: ["maxShare", vaultAddress],
    queryFn: () => fetchMaxShare(vaultAddress),
    staleTime: 1000 * 60 * 5,
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
  const ratio = useMemo(
    () => estimateRatio(totalAssets, totalShares),
    [totalAssets, totalShares],
  );

  // Claimable reward: mirrors rewardable::claimable on-chain
  // result of vaultPosition.claimable() is in USDC raw units (6 decimals)
  const { claimableAmount, totalAmount } = useMemo(() => {
    if (!vaultPosition || !vaultInfo)
      return { claimableAmount: 0, totalAmount: 0 };
    const vNumsSharesBigInt = toBigInt(vNumsBalance);
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
  }, [vaultPosition, vaultInfo, vNumsBalance, totalShares]);

  // Yield APR: placeholder until on-chain data is available
  const yieldValue = useMemo((): number | undefined => undefined, []);

  const handleDepositChange = useCallback(
    (value: number) => {
      setDepositValue(value);
      setMintLoading(true);
      clearTimeout(mintTimer.current);
      mintTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewDeposit(toBigInt(value));
          setMintValue(toNumber(result));
        } finally {
          setMintLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls],
  );

  const handleMintChange = useCallback(
    (value: number) => {
      setMintValue(value);
      setDepositLoading(true);
      clearTimeout(depositTimer.current);
      depositTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewMint(toBigInt(value));
          setDepositValue(toNumber(result));
        } finally {
          setDepositLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls],
  );

  const handleRedeemChange = useCallback(
    (value: number) => {
      setRedeemValue(value);
      setWithdrawLoading(true);
      clearTimeout(withdrawTimer.current);
      withdrawTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewRedeem(toBigInt(value));
          setWithdrawValue(toNumber(result));
        } finally {
          setWithdrawLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls],
  );

  const handleWithdrawChange = useCallback(
    (value: number) => {
      setWithdrawValue(value);
      setRedeemLoading(true);
      clearTimeout(redeemTimer.current);
      redeemTimer.current = setTimeout(async () => {
        try {
          const result = await calls.previewWithdraw(toBigInt(value));
          setRedeemValue(toNumber(result));
        } finally {
          setRedeemLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [calls],
  );

  const handleStake = useCallback(async () => {
    if (depositValue > 0) {
      await vault.deposit(toBigInt(depositValue));
      setDepositValue(0);
      setMintValue(0);
    }
  }, [vault, depositValue]);

  const handleUnstake = useCallback(async () => {
    if (redeemValue > 0) {
      await vault.redeem(toBigInt(redeemValue));
      setRedeemValue(0);
      setWithdrawValue(0);
    }
  }, [vault, redeemValue]);

  return useMemo(
    () => ({
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
        totalShare: toNumber(totalShares),
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
        totalStaked: toNumber(totalAssets) - maxShare,
        totalShares: maxShare,
      },
      vaultProps: {
        vaultAmount: totalAmount,
        usdcPrice: 1,
      },
      supplyProps: {
        totalShares: toNumber(totalShares),
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
