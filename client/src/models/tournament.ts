import { MemberClause, type ParsedEntity } from "@dojoengine/sdk";
import type { SchemaType } from "@/bindings/typescript/models.gen";
import { NAMESPACE } from "@/constants";
import { Power } from "@/types/power";

const MODEL_NAME = "Tournament";

export class TournamentModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public powers: Power[],
    public entry_count: number,
    public start_time: Date,
    public end_time: Date,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.powers = powers;
    this.entry_count = entry_count;
    this.start_time = start_time;
    this.end_time = end_time;
  }

  static from(identifier: string, model: any) {
    if (!model) return TournamentModel.default(identifier);
    const id = Number(model.id);
    const powers = Power.getPowers(BigInt(model.powers));
    return new TournamentModel(
      identifier,
      id,
      powers,
      Number(model.entry_count),
      new Date(Number(model.start_time) * 1000),
      new Date(Number(model.end_time) * 1000),
    );
  }

  static default(identifier: string) {
    return new TournamentModel(identifier, 0, [], 0, new Date(), new Date());
  }

  static isType(model: TournamentModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.start_time.getTime() > 0;
  }

  clone(): TournamentModel {
    return new TournamentModel(
      this.identifier,
      this.id,
      this.powers,
      this.entry_count,
      this.start_time,
      this.end_time,
    );
  }

  hasStarted() {
    return this.start_time.getTime() <= Date.now();
  }

  hasEnded() {
    return this.end_time.getTime() < Date.now();
  }

  isActive() {
    return this.hasStarted() && !this.hasEnded();
  }
}

export const Tournament = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return TournamentModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(
      `${NAMESPACE}-${Tournament.getModelName()}`,
      "start_time",
      "Neq",
      "0",
    );
  },

  getMethods: () => [],
};
