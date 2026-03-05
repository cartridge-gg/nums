import { useCallback, useMemo } from "react";
import { useNetwork } from "@starknet-react/core";
import { useQueryClient } from "@tanstack/react-query";
import { CallData, RpcProvider, uint256 } from "starknet";
import { dojoConfigs, getVaultAddress } from "@/config";

/** Stale time for ERC4626 preview calls — short enough to stay fresh during interactions */
const STALE_TIME = 15_000; // 15 seconds

/** Parse a u256 return value (two consecutive felts) into a bigint */
const parseU256 = (result: string[]): bigint =>
  uint256.uint256ToBN({ low: result[0], high: result[1] });

/** Encode a bigint as a u256 calldata array [low, high] */
const encodeU256 = (value: bigint): string[] => {
  const { low, high } = uint256.bnToUint256(value);
  return CallData.compile({ low, high });
};

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
        queryKey: ["vault", "preview_deposit", vaultAddress, assets.toString()],
        queryFn: async () => {
          const result = await provider.callContract({
            contractAddress: vaultAddress,
            entrypoint: "preview_deposit",
            calldata: encodeU256(assets),
          });
          return parseU256(result);
        },
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
        queryKey: ["vault", "preview_mint", vaultAddress, shares.toString()],
        queryFn: async () => {
          const result = await provider.callContract({
            contractAddress: vaultAddress,
            entrypoint: "preview_mint",
            calldata: encodeU256(shares),
          });
          return parseU256(result);
        },
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
        queryKey: [
          "vault",
          "preview_withdraw",
          vaultAddress,
          assets.toString(),
        ],
        queryFn: async () => {
          const result = await provider.callContract({
            contractAddress: vaultAddress,
            entrypoint: "preview_withdraw",
            calldata: encodeU256(assets),
          });
          return parseU256(result);
        },
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
        queryKey: ["vault", "preview_redeem", vaultAddress, shares.toString()],
        queryFn: async () => {
          const result = await provider.callContract({
            contractAddress: vaultAddress,
            entrypoint: "preview_redeem",
            calldata: encodeU256(shares),
          });
          return parseU256(result);
        },
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
