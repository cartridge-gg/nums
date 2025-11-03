import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Reward";

export class RewardModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public tournament_id: number,
    public address: string,
    public gameId: number,
    public claimed: boolean,
  ) {
    this.identifier = identifier;
    this.tournament_id = tournament_id;
    this.address = address;
    this.gameId = gameId;
    this.claimed = claimed;
  }

  static from(identifier: string, model: any) {
    if (!model) return RewardModel.default(identifier);
    const tournament_id = Number(model.tournament_id);
    const address = model.address;
    const gameId = Number(model.game_id);
    const claimed = !!model.claimed;
    return new RewardModel(identifier, tournament_id, address, gameId, claimed);
  }

  static default(identifier: string) {
    return new RewardModel(identifier, 0, "0x0", 0, false);
  }

  static isType(model: RewardModel) {
    return model.type === MODEL_NAME;
  }

  clone(): RewardModel {
    return new RewardModel(
      this.identifier,
      this.tournament_id,
      this.address,
      this.gameId,
      this.claimed,
    );
  }
}

export const Reward = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return RewardModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
