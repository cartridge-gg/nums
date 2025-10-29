import type { ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";

const MODEL_NAME = "Leaderboard";

export class LeaderboardModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public tournament_id: number,
    public capacity: number,
    public requirement: number,
    public games: number[],
  ) {
    this.identifier = identifier;
    this.tournament_id = tournament_id;
    this.capacity = capacity;
    this.requirement = requirement;
    this.games = games;
  }

  static from(identifier: string, model: any) {
    if (!model) return LeaderboardModel.default(identifier);
    const tournament_id = Number(model.tournament_id);
    const capacity = Number(model.capacity);
    const requirement = Number(model.requirement);
    const games = model.games.map((game: any) => Number(game));
    return new LeaderboardModel(
      identifier,
      tournament_id,
      capacity,
      requirement,
      games,
    );
  }

  static default(identifier: string) {
    return new LeaderboardModel(identifier, 0, 0, 0, []);
  }

  static isType(model: LeaderboardModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.capacity !== 0;
  }

  clone(): LeaderboardModel {
    return new LeaderboardModel(
      this.identifier,
      this.tournament_id,
      this.capacity,
      this.requirement,
      this.games,
    );
  }
}

export const Leaderboard = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return LeaderboardModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
