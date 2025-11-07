import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Claim";

export class ClaimModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public player: string,
    public starterpack_id: number,
    public claimed: boolean,
  ) {
    this.identifier = identifier;
    this.player = player;
    this.starterpack_id = starterpack_id;
    this.claimed = claimed;
  }

  static from(identifier: string, model: any) {
    if (!model) return ClaimModel.default(identifier);
    const player = model.player;
    const starterpack_id = Number(model.starterpack_id);
    const claimed = !!model.claimed;
    return new ClaimModel(identifier, player, starterpack_id, claimed);
  }

  static default(identifier: string) {
    return new ClaimModel(identifier, "0x0", 0, false);
  }

  static isType(model: ClaimModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.claimed;
  }

  clone(): ClaimModel {
    return new ClaimModel(
      this.identifier,
      this.player,
      this.starterpack_id,
      this.claimed,
    );
  }
}

export const Claim = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return ClaimModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
