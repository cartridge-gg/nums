import type { RawClaimed } from "@/models";

const MODEL_NAME = "Claimed";

export class Claimed {
  type = MODEL_NAME;

  constructor(
    public player_id: string,
    public game_id: number,
    public reward: number,
    public time: number,
  ) {
    this.player_id = player_id;
    this.game_id = game_id;
    this.reward = reward;
    this.time = time;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawClaimed): Claimed {
    return Claimed.parse(data);
  }

  static parse(data: RawClaimed) {
    const props = {
      player_id: data.player_id.value,
      game_id: Number(data.game_id.value),
      reward: Number(data.reward.value),
      time: Number(data.time.value),
    };
    return new Claimed(
      props.player_id,
      props.game_id,
      props.reward,
      props.time,
    );
  }

  static dedupe(claimeds: Claimed[]): Claimed[] {
    return claimeds.filter(
      (claimed, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === claimed.player_id && t.game_id === claimed.game_id,
        ),
    );
  }

  static getId(claimed: Claimed): string {
    return `${claimed.player_id}-${claimed.game_id}-${claimed.time}`;
  }
}
