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

  /**
   * Calculate the dynamic capacity based on entry count.
   * Top 10% of entrants with specific criteria for low entry counts.
   * Based on https://www.wsoponline.com/how-to-play-poker/mtt-tournament-payouts/
   * @param entryCount - The number of tournament entries
   * @returns The dynamic capacity (number of winners)
   */
  getCapacity(entryCount: number): number {
    // Top 10% of entrants with specific criteria for low entry counts
    const entryCriteria =
      entryCount < 3
        ? 1
        : entryCount < 11
          ? 2
          : Math.floor((entryCount + 9) / 10);

    const gamesCriteria = Math.min(this.capacity, this.games.length);
    return Math.min(entryCriteria, gamesCriteria);
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
