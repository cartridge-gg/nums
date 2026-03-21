import type * as torii from "@dojoengine/torii-wasm";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { NAMESPACE } from "@/constants";
import {
  type RawPurchased,
  type RawStarted,
  type RawClaimed,
  type RawScore,
  Purchased as PurchasedModel,
  Started as StartedModel,
  Claimed as ClaimedModel,
  Score as ScoreModel,
} from "@/models";

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function query() {
  const purchased: `${string}-${string}` = `${NAMESPACE}-${PurchasedModel.getModelName()}`;
  const started: `${string}-${string}` = `${NAMESPACE}-${StartedModel.getModelName()}`;
  const claimed: `${string}-${string}` = `${NAMESPACE}-${ClaimedModel.getModelName()}`;
  const score: `${string}-${string}` = `${NAMESPACE}-${ScoreModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [purchased, started, claimed, score],
    [],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function parsePurchaseds(entities: torii.Entity[]): PurchasedModel[] {
  const items: PurchasedModel[] = [];
  const key = modelKey(PurchasedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        PurchasedModel.parse(entity.models[key] as unknown as RawPurchased),
      );
    }
  }
  return PurchasedModel.dedupe(items.sort((a, b) => b.time - a.time)).slice(
    0,
    10,
  );
}

function parseStarteds(entities: torii.Entity[]): StartedModel[] {
  const items: StartedModel[] = [];
  const key = modelKey(StartedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        StartedModel.parse(entity.models[key] as unknown as RawStarted),
      );
    }
  }
  return StartedModel.dedupe(items.sort((a, b) => b.time - a.time)).slice(
    0,
    10,
  );
}

function parseClaimeds(entities: torii.Entity[]): ClaimedModel[] {
  const items: ClaimedModel[] = [];
  const key = modelKey(ClaimedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        ClaimedModel.parse(entity.models[key] as unknown as RawClaimed),
      );
    }
  }
  return ClaimedModel.dedupe(items.sort((a, b) => b.time - a.time)).slice(
    0,
    10,
  );
}

function parseScores(entities: torii.Entity[]): ScoreModel[] {
  const items: ScoreModel[] = [];
  const key = modelKey(ScoreModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(ScoreModel.parse(entity.models[key] as unknown as RawScore));
    }
  }
  return ScoreModel.dedupe(items);
}

export const Event = {
  keys: {
    purchased: () => ["events", "purchased"] as const,
    started: () => ["events", "started"] as const,
    claimed: () => ["events", "claimed"] as const,
    scores: () => ["events", "scores"] as const,
  },
  query,
  parsePurchaseds,
  parseStarteds,
  parseClaimeds,
  parseScores,
};
