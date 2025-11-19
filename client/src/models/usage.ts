import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Usage";

export class UsageModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public world_resource: string,
    public last_update: number,
    public board: bigint,
  ) {
    this.identifier = identifier;
    this.world_resource = world_resource;
    this.last_update = last_update;
    // this.board = board;
    this.board = 0n;
  }

  static from(identifier: string, model: any) {
    if (!model) return UsageModel.default(identifier);
    const world_resource = model.world_resource;
    const last_update = Number(model.last_update);
    const board = BigInt(model.board);
    return new UsageModel(identifier, world_resource, last_update, board);
  }

  static default(identifier: string) {
    return new UsageModel(identifier, "0x0", 0, 0n);
  }

  static isType(model: UsageModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.board !== 0n;
  }

  clone(): UsageModel {
    return new UsageModel(
      this.identifier,
      this.world_resource,
      this.last_update,
      this.board,
    );
  }
}

export const Usage = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return UsageModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
