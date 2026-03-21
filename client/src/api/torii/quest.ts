import type * as torii from "@dojoengine/torii-wasm";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { getChecksumAddress } from "starknet";
import { NAMESPACE } from "@/constants";
import {
  type RawQuestDefinition,
  type RawQuestCompletion,
  type RawQuestAdvancement,
  type RawQuestCreation,
  type RawQuestCompleted,
  type RawQuestClaimed,
  QuestDefinition as QuestDefinitionModel,
  QuestCompletion as QuestCompletionModel,
  QuestAdvancement as QuestAdvancementModel,
  QuestCreation as QuestCreationModel,
  QuestCompleted as QuestCompletedModel,
  QuestClaimed as QuestClaimedModel,
} from "@/models";

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function definitionsQuery() {
  const definition: `${string}-${string}` = `${NAMESPACE}-${QuestDefinitionModel.getModelName()}`;
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
  const creation: `${string}-${string}` = `${NAMESPACE}-${QuestCreationModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys([creation], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function playerQuery(playerId: string) {
  const completion: `${string}-${string}` = `${NAMESPACE}-${QuestCompletionModel.getModelName()}`;
  const advancement: `${string}-${string}` = `${NAMESPACE}-${QuestAdvancementModel.getModelName()}`;
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

function eventsQuery(playerId: string) {
  const completed: `${string}-${string}` = `${NAMESPACE}-${QuestCompletedModel.getModelName()}`;
  const claimed: `${string}-${string}` = `${NAMESPACE}-${QuestClaimedModel.getModelName()}`;
  const key = getChecksumAddress(BigInt(playerId)).toLowerCase();
  const clauses = new ClauseBuilder().keys(
    [completed, claimed],
    [key],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function parseDefinitions(entities: torii.Entity[]): QuestDefinitionModel[] {
  const items: QuestDefinitionModel[] = [];
  const key = modelKey(QuestDefinitionModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        QuestDefinitionModel.parse(
          entity.models[key] as unknown as RawQuestDefinition,
        ),
      );
    }
  }
  return QuestDefinitionModel.deduplicate(items);
}

function parseCreations(entities: torii.Entity[]): QuestCreationModel[] {
  const items: QuestCreationModel[] = [];
  const key = modelKey(QuestCreationModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        QuestCreationModel.parse(
          entity.models[key] as unknown as RawQuestCreation,
        ),
      );
    }
  }
  return QuestCreationModel.deduplicate(items);
}

function parseCompletions(entities: torii.Entity[]): QuestCompletionModel[] {
  const items: QuestCompletionModel[] = [];
  const key = modelKey(QuestCompletionModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        QuestCompletionModel.parse(
          entity.models[key] as unknown as RawQuestCompletion,
        ),
      );
    }
  }
  return QuestCompletionModel.deduplicate(items);
}

function parseAdvancements(entities: torii.Entity[]): QuestAdvancementModel[] {
  const items: QuestAdvancementModel[] = [];
  const key = modelKey(QuestAdvancementModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        QuestAdvancementModel.parse(
          entity.models[key] as unknown as RawQuestAdvancement,
        ),
      );
    }
  }
  return QuestAdvancementModel.deduplicate(items);
}

function parseCompleted(entities: torii.Entity[]): QuestCompletedModel[] {
  const items: QuestCompletedModel[] = [];
  const key = modelKey(QuestCompletedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        QuestCompletedModel.parse(
          entity.models[key] as unknown as RawQuestCompleted,
        ),
      );
    }
  }
  return items;
}

function parseClaimed(entities: torii.Entity[]): QuestClaimedModel[] {
  const items: QuestClaimedModel[] = [];
  const key = modelKey(QuestClaimedModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        QuestClaimedModel.parse(
          entity.models[key] as unknown as RawQuestClaimed,
        ),
      );
    }
  }
  return items;
}

export const Quest = {
  keys: {
    definitions: () => ["quests", "definitions"] as const,
    creations: () => ["quests", "creations"] as const,
    playerCompletions: (address: string) =>
      ["quests", "completions", address] as const,
    playerAdvancements: (address: string) =>
      ["quests", "advancements", address] as const,
  },
  definitionsQuery,
  creationsQuery,
  playerQuery,
  eventsQuery,
  parseDefinitions,
  parseCreations,
  parseCompletions,
  parseAdvancements,
  parseCompleted,
  parseClaimed,
};
