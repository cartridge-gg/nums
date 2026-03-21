import type * as torii from "@dojoengine/torii-wasm";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { getChecksumAddress } from "starknet";
import { NAMESPACE } from "@/constants";
import {
  type RawVaultInfo,
  type RawVaultPosition,
  type RawVaultClaimed,
  VaultInfo as VaultInfoModel,
  VaultPosition as VaultPositionModel,
  VaultClaimed as VaultClaimedModel,
} from "@/models";

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function infoQuery() {
  const model: `${string}-${string}` = `${NAMESPACE}-${VaultInfoModel.getModelName()}`;
  return new ToriiQueryBuilder()
    .withClause(
      new ClauseBuilder().keys([model], [undefined], "FixedLen").build(),
    )
    .includeHashedKeys();
}

function positionQuery(userAddress: string) {
  const model: `${string}-${string}` = `${NAMESPACE}-${VaultPositionModel.getModelName()}`;
  const key = getChecksumAddress(BigInt(userAddress)).toLowerCase();
  return new ToriiQueryBuilder()
    .withClause(new ClauseBuilder().keys([model], [key], "VariableLen").build())
    .includeHashedKeys();
}

function claimedQuery(userAddress: string) {
  const model: `${string}-${string}` = `${NAMESPACE}-${VaultClaimedModel.getModelName()}`;
  const key = getChecksumAddress(BigInt(userAddress)).toLowerCase();
  return new ToriiQueryBuilder()
    .withClause(new ClauseBuilder().keys([model], [key], "VariableLen").build())
    .includeHashedKeys();
}

function parseInfo(entities: torii.Entity[]): VaultInfoModel | undefined {
  const key = modelKey(VaultInfoModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = VaultInfoModel.parse(
        entity.models[key] as unknown as RawVaultInfo,
      );
      if (parsed.exists()) return parsed;
    }
  }
  return undefined;
}

function parsePosition(
  entities: torii.Entity[],
): VaultPositionModel | undefined {
  const key = modelKey(VaultPositionModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = VaultPositionModel.parse(
        entity.models[key] as unknown as RawVaultPosition,
      );
      if (parsed.exists()) return parsed;
    }
  }
  return undefined;
}

function parseClaimed(entities: torii.Entity[]): VaultClaimedModel | undefined {
  const key = modelKey(VaultClaimedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = VaultClaimedModel.parse(
        entity.models[key] as unknown as RawVaultClaimed,
      );
      if (parsed.exists()) return parsed;
    }
  }
  return undefined;
}

export const Vault = {
  keys: {
    previewDeposit: (address: string, assets: string) =>
      ["vault", "preview_deposit", address, assets] as const,
    previewMint: (address: string, shares: string) =>
      ["vault", "preview_mint", address, shares] as const,
    previewWithdraw: (address: string, assets: string) =>
      ["vault", "preview_withdraw", address, assets] as const,
    previewRedeem: (address: string, shares: string) =>
      ["vault", "preview_redeem", address, shares] as const,
    maxShare: (address: string) => ["maxShare", address] as const,
    info: () => ["vaultInfo"] as const,
    position: (addr: string) => ["vaultPosition", addr] as const,
    claimed: (addr: string) => ["vaultClaimed", addr] as const,
  },
  infoQuery,
  positionQuery,
  claimedQuery,
  parseInfo,
  parsePosition,
  parseClaimed,
};
