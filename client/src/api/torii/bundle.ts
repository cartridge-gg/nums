import type * as torii from "@dojoengine/torii-wasm";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { getChecksumAddress } from "starknet";
import { NAMESPACE } from "@/constants";
import {
  type RawBundle,
  type RawBundleIssuance,
  type RawBundleReferral,
  type RawBundleGroup,
  type RawBundleVoucher,
  type RawBundleRegistered,
  type RawBundleUpdated,
  type RawBundleIssued,
  Bundle as BundleModel,
  BundleIssuance as BundleIssuanceModel,
  BundleReferral as BundleReferralModel,
  BundleGroup as BundleGroupModel,
  BundleVoucher as BundleVoucherModel,
  BundleRegistered as BundleRegisteredModel,
  BundleUpdated as BundleUpdatedModel,
  BundleIssued as BundleIssuedModel,
} from "@/models";

const ENTITIES_LIMIT = 10_000;

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function allBundlesQuery() {
  const bundle: `${string}-${string}` = `${NAMESPACE}-${BundleModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys([bundle], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
}

function issuancesByBundleQuery(bundleId: number) {
  const issuance: `${string}-${string}` = `${NAMESPACE}-${BundleIssuanceModel.getModelName()}`;
  const key = `0x${bundleId.toString(16).padStart(8, "0")}`;
  const clauses = new ClauseBuilder().keys([issuance], [key], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
}

function referralQuery(address: string) {
  const referral: `${string}-${string}` = `${NAMESPACE}-${BundleReferralModel.getModelName()}`;
  const key = getChecksumAddress(BigInt(address)).toLowerCase();
  const clauses = new ClauseBuilder().keys([referral], [key], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function groupQuery(groupId: string) {
  const group: `${string}-${string}` = `${NAMESPACE}-${BundleGroupModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys([group], [groupId], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function vouchersByBundleQuery(bundleId: number) {
  const voucher: `${string}-${string}` = `${NAMESPACE}-${BundleVoucherModel.getModelName()}`;
  const key = `0x${bundleId.toString(16).padStart(8, "0")}`;
  const clauses = new ClauseBuilder().keys([voucher], [key], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
}

function eventsQuery() {
  const registered: `${string}-${string}` = `${NAMESPACE}-${BundleRegisteredModel.getModelName()}`;
  const updated: `${string}-${string}` = `${NAMESPACE}-${BundleUpdatedModel.getModelName()}`;
  const issued: `${string}-${string}` = `${NAMESPACE}-${BundleIssuedModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [registered, updated, issued],
    [],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function parseBundles(entities: torii.Entity[]): BundleModel[] {
  const items: BundleModel[] = [];
  const key = modelKey(BundleModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = BundleModel.parse(
        entity.models[key] as unknown as RawBundle,
      );
      if (parsed.exists()) items.push(parsed);
    }
  }
  return BundleModel.dedupe(items);
}

function parseIssuances(entities: torii.Entity[]): BundleIssuanceModel[] {
  const items: BundleIssuanceModel[] = [];
  const key = modelKey(BundleIssuanceModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = BundleIssuanceModel.parse(
        entity.models[key] as unknown as RawBundleIssuance,
      );
      if (parsed.exists()) items.push(parsed);
    }
  }
  return BundleIssuanceModel.dedupe(items);
}

function parseReferrals(entities: torii.Entity[]): BundleReferralModel[] {
  const items: BundleReferralModel[] = [];
  const key = modelKey(BundleReferralModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = BundleReferralModel.parse(
        entity.models[key] as unknown as RawBundleReferral,
      );
      if (parsed.exists()) items.push(parsed);
    }
  }
  return BundleReferralModel.dedupe(items);
}

function parseGroups(entities: torii.Entity[]): BundleGroupModel[] {
  const items: BundleGroupModel[] = [];
  const key = modelKey(BundleGroupModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = BundleGroupModel.parse(
        entity.models[key] as unknown as RawBundleGroup,
      );
      if (parsed.exists()) items.push(parsed);
    }
  }
  return BundleGroupModel.dedupe(items);
}

function parseVouchers(entities: torii.Entity[]): BundleVoucherModel[] {
  const items: BundleVoucherModel[] = [];
  const key = modelKey(BundleVoucherModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        BundleVoucherModel.parse(
          entity.models[key] as unknown as RawBundleVoucher,
        ),
      );
    }
  }
  return BundleVoucherModel.dedupe(items);
}

function parseRegisteredEvents(
  entities: torii.Entity[],
): BundleRegisteredModel[] {
  const items: BundleRegisteredModel[] = [];
  const key = modelKey(BundleRegisteredModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        BundleRegisteredModel.parse(
          entity.models[key] as unknown as RawBundleRegistered,
        ),
      );
    }
  }
  return BundleRegisteredModel.dedupe(
    items.sort((a, b) => b.time - a.time),
  ).slice(0, 10);
}

function parseUpdatedEvents(entities: torii.Entity[]): BundleUpdatedModel[] {
  const items: BundleUpdatedModel[] = [];
  const key = modelKey(BundleUpdatedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        BundleUpdatedModel.parse(
          entity.models[key] as unknown as RawBundleUpdated,
        ),
      );
    }
  }
  return BundleUpdatedModel.dedupe(items.sort((a, b) => b.time - a.time)).slice(
    0,
    10,
  );
}

function parseIssuedEvents(entities: torii.Entity[]): BundleIssuedModel[] {
  const items: BundleIssuedModel[] = [];
  const key = modelKey(BundleIssuedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        BundleIssuedModel.parse(
          entity.models[key] as unknown as RawBundleIssued,
        ),
      );
    }
  }
  return BundleIssuedModel.dedupe(items.sort((a, b) => b.time - a.time)).slice(
    0,
    10,
  );
}

export const BundleApi = {
  keys: {
    all: () => ["bundles"] as const,
    issuances: (bundleId: number) =>
      ["bundles", "issuances", bundleId] as const,
    referral: (address: string) => ["bundles", "referral", address] as const,
    group: (groupId: string) => ["bundles", "group", groupId] as const,
    vouchers: (bundleId: number) => ["bundles", "vouchers", bundleId] as const,
    events: {
      registered: () => ["bundles", "events", "registered"] as const,
      updated: () => ["bundles", "events", "updated"] as const,
      issued: () => ["bundles", "events", "issued"] as const,
    },
  },
  allBundlesQuery,
  issuancesByBundleQuery,
  referralQuery,
  groupQuery,
  vouchersByBundleQuery,
  eventsQuery,
  parseBundles,
  parseIssuances,
  parseReferrals,
  parseGroups,
  parseVouchers,
  parseRegisteredEvents,
  parseUpdatedEvents,
  parseIssuedEvents,
};
