import type { RawReward } from "@/models";

const MODEL_NAME = "Reward";

export class Reward {
  type = MODEL_NAME;

  constructor(
    public game_id: number,
    public reward: number,
  ) {
    this.game_id = game_id;
    this.reward = reward;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawReward): Reward {
    return Reward.parse(data);
  }

  static parse(data: RawReward) {
    const props = {
      game_id: Number(data.game_id.value),
      reward: Number(data.reward.value),
    };
    return new Reward(props.game_id, props.reward);
  }

  static deduplicate(items: Reward[]): Reward[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.game_id === item.game_id && t.reward === item.reward,
        ),
    );
  }
}
