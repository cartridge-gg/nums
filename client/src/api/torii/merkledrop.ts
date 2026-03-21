import type * as torii from "@dojoengine/torii-wasm";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { NAMESPACE } from "@/constants";
import {
  type RawMerkleTree,
  type RawMerkleClaim,
  type RawMerkleProofs,
  MerkleTree as MerkleTreeModel,
  MerkleClaim as MerkleClaimModel,
  MerkleProofs as MerkleProofsModel,
} from "@/models";

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function treesQuery() {
  const tree: `${string}-${string}` = `${NAMESPACE}-${MerkleTreeModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys([tree], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function proofsQuery(playerId: string) {
  const model = `${NAMESPACE}-${MerkleProofsModel.getModelName()}`;
  const clauses = new ClauseBuilder().where(
    model as `${string}-${string}`,
    "recipient" as never,
    "Eq",
    { type: "Felt252", value: playerId },
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function claimQuery(root: string, leaf: string) {
  const claim: `${string}-${string}` = `${NAMESPACE}-${MerkleClaimModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys([claim], [root, leaf], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function parseTrees(entities: torii.Entity[]): MerkleTreeModel[] {
  const items: MerkleTreeModel[] = [];
  const key = modelKey(MerkleTreeModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        MerkleTreeModel.parse(entity.models[key] as unknown as RawMerkleTree),
      );
    }
  }
  return MerkleTreeModel.deduplicate(items);
}

function parseProofs(entities: torii.Entity[]): MerkleProofsModel[] {
  const items: MerkleProofsModel[] = [];
  const key = modelKey(MerkleProofsModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        MerkleProofsModel.parse(
          entity.models[key] as unknown as RawMerkleProofs,
        ),
      );
    }
  }
  return MerkleProofsModel.deduplicate(items);
}

function parseClaims(entities: torii.Entity[]): MerkleClaimModel[] {
  const items: MerkleClaimModel[] = [];
  const key = modelKey(MerkleClaimModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      items.push(
        MerkleClaimModel.parse(entity.models[key] as unknown as RawMerkleClaim),
      );
    }
  }
  return MerkleClaimModel.deduplicate(items);
}

export const Merkledrop = {
  keys: {
    trees: () => ["merkledrops", "trees"] as const,
    proofs: (address: string) => ["merkledrops", "proofs", address] as const,
    claims: (root: string, leaf: string) =>
      ["merkledrops", "claims", root, leaf] as const,
  },
  treesQuery,
  proofsQuery,
  claimQuery,
  parseTrees,
  parseProofs,
  parseClaims,
};
