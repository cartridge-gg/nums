import { useCallback, useMemo } from "react";
import { useNetwork } from "@starknet-react/core";
import { useQueryClient } from "@tanstack/react-query";
import { RpcProvider } from "starknet";
import { queryKeys } from "@/api/keys";
import {
  previewDeposit as previewDepositRpc,
  previewMint as previewMintRpc,
  previewWithdraw as previewWithdrawRpc,
  previewRedeem as previewRedeemRpc,
} from "@/api/rpc";
import { dojoConfigs, getVaultAddress } from "@/config";

/** Stale time for ERC4626 preview calls — short enough to stay fresh during interactions */
const STALE_TIME = 15_000; // 15 seconds

export const useCalls = () => {
  const { chain } = useNetwork();
  const queryClient = useQueryClient();

  const chainIdHex = `0x${chain.id.toString(16)}`;
  const rpcUrl = dojoConfigs[chainIdHex]?.rpcUrl;
  const vaultAddress = getVaultAddress(chain.id);

  const provider = useMemo(
    () => new RpcProvider({ nodeUrl: rpcUrl }),
    [rpcUrl],
  );

  /**
   * ERC4626 — how many shares are minted for a given assets amount.
   * Equivalent to vault.preview_deposit(assets).
   * Returns 0n if assets is 0 or vaultAddress is unavailable.
   */
  const previewDeposit = useCallback(
    (assets: bigint): Promise<bigint> => {
      if (!vaultAddress || assets === 0n) return Promise.resolve(0n);
      return queryClient.fetchQuery({
        queryKey: queryKeys.vault.previewDeposit(
          vaultAddress,
          assets.toString(),
        ),
        queryFn: () => previewDepositRpc(provider, vaultAddress, assets),
        staleTime: STALE_TIME,
      });
    },
    [queryClient, provider, vaultAddress],
  );

  /**
   * ERC4626 — how many assets are needed to mint a given shares amount.
   * Equivalent to vault.preview_mint(shares).
   * Returns 0n if shares is 0 or vaultAddress is unavailable.
   */
  const previewMint = useCallback(
    (shares: bigint): Promise<bigint> => {
      if (!vaultAddress || shares === 0n) return Promise.resolve(0n);
      return queryClient.fetchQuery({
        queryKey: queryKeys.vault.previewMint(vaultAddress, shares.toString()),
        queryFn: () => previewMintRpc(provider, vaultAddress, shares),
        staleTime: STALE_TIME,
      });
    },
    [queryClient, provider, vaultAddress],
  );

  /**
   * ERC4626 — how many shares must be burned to withdraw a given assets amount.
   * Equivalent to vault.preview_withdraw(assets).
   * Returns 0n if assets is 0 or vaultAddress is unavailable.
   */
  const previewWithdraw = useCallback(
    (assets: bigint): Promise<bigint> => {
      if (!vaultAddress || assets === 0n) return Promise.resolve(0n);
      return queryClient.fetchQuery({
        queryKey: queryKeys.vault.previewWithdraw(
          vaultAddress,
          assets.toString(),
        ),
        queryFn: () => previewWithdrawRpc(provider, vaultAddress, assets),
        staleTime: STALE_TIME,
      });
    },
    [queryClient, provider, vaultAddress],
  );

  /**
   * ERC4626 — how many assets are returned for a given shares amount.
   * Equivalent to vault.preview_redeem(shares).
   * Returns 0n if shares is 0 or vaultAddress is unavailable.
   */
  const previewRedeem = useCallback(
    (shares: bigint): Promise<bigint> => {
      if (!vaultAddress || shares === 0n) return Promise.resolve(0n);
      return queryClient.fetchQuery({
        queryKey: queryKeys.vault.previewRedeem(
          vaultAddress,
          shares.toString(),
        ),
        queryFn: () => previewRedeemRpc(provider, vaultAddress, shares),
        staleTime: STALE_TIME,
      });
    },
    [queryClient, provider, vaultAddress],
  );

  return {
    previewDeposit,
    previewMint,
    previewWithdraw,
    previewRedeem,
  };
};
