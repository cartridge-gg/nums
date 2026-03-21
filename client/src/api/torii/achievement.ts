import type * as torii from "@dojoengine/torii-wasm";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { getChecksumAddress } from "starknet";
import { NAMESPACE } from "@/constants";
import {
  type RawAchievementDefinition,
  type RawAchievementCompletion,
  type RawAchievementAdvancement,
  type RawAchievementCreation,
  type RawAchievementCompleted,
  AchievementDefinition as AchievementDefinitionModel,
  AchievementCompletion as AchievementCompletionModel,
  AchievementAdvancement as AchievementAdvancementModel,
  AchievementCreation as AchievementCreationModel,
  AchievementCompleted as AchievementCompletedModel,
} from "@/models";

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function definitionsQuery() {
  const definition: `${string}-${string}` = `${NAMESPACE}-${AchievementDefinitionModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [definition],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function creationsQuery() {
  const creation: `${string}-${string}` = `${NAMESPACE}-${AchievementCreationModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys([creation], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function playerQuery(playerId: string) {
  const completion: `${string}-${string}` = `${NAMESPACE}-${AchievementCompletionModel.getModelName()}`;
  const advancement: `${string}-${string}` = `${NAMESPACE}-${AchievementAdvancementModel.getModelName()}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys(
    [completion, advancement],
    [key],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function completedQuery(playerId: string) {
  const completed: `${string}-${string}` = `${NAMESPACE}-${AchievementCompletedModel.getModelName()}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys([completed], [key], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function parseDefinitions(
  entities: torii.Entity[],
): AchievementDefinitionModel[] {
  const items: AchievementDefinitionModel[] = [];
  const key = modelKey(AchievementDefinitionModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        AchievementDefinitionModel.parse(
          entity.models[key] as unknown as RawAchievementDefinition,
        ),
      );
    }
  }
  return AchievementDefinitionModel.deduplicate(items);
}

function parseCreations(entities: torii.Entity[]): AchievementCreationModel[] {
  const items: AchievementCreationModel[] = [];
  const key = modelKey(AchievementCreationModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        AchievementCreationModel.parse(
          entity.models[key] as unknown as RawAchievementCreation,
        ),
      );
    }
  }
  return items;
}

function parseCompletions(
  entities: torii.Entity[],
): AchievementCompletionModel[] {
  const items: AchievementCompletionModel[] = [];
  const key = modelKey(AchievementCompletionModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        AchievementCompletionModel.parse(
          entity.models[key] as unknown as RawAchievementCompletion,
        ),
      );
    }
  }
  return AchievementCompletionModel.deduplicate(items);
}

function parseAdvancements(
  entities: torii.Entity[],
): AchievementAdvancementModel[] {
  const items: AchievementAdvancementModel[] = [];
  const key = modelKey(AchievementAdvancementModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        AchievementAdvancementModel.parse(
          entity.models[key] as unknown as RawAchievementAdvancement,
        ),
      );
    }
  }
  return AchievementAdvancementModel.deduplicate(items);
}

function parseCompleted(entities: torii.Entity[]): AchievementCompletedModel[] {
  const items: AchievementCompletedModel[] = [];
  const key = modelKey(AchievementCompletedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        AchievementCompletedModel.parse(
          entity.models[key] as unknown as RawAchievementCompleted,
        ),
      );
    }
  }
  return items;
}

export const Achievement = {
  keys: {
    definitions: () => ["achievements", "definitions"] as const,
    creations: () => ["achievements", "creations"] as const,
    playerCompletions: (address: string) =>
      ["achievements", "completions", address] as const,
    playerAdvancements: (address: string) =>
      ["achievements", "advancements", address] as const,
  },
  definitionsQuery,
  creationsQuery,
  playerQuery,
  completedQuery,
  parseDefinitions,
  parseCreations,
  parseCompletions,
  parseAdvancements,
  parseCompleted,
};
