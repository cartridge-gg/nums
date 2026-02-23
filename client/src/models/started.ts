import type { EventProps } from "@/components/elements";
import type { RawStarted } from "@/models";

const MODEL_NAME = "Started";

export class Started {
  type = MODEL_NAME;

  constructor(
    public player_id: string,
    public game_id: number,
    public multiplier: number,
    public time: number,
  ) {
    this.player_id = player_id;
    this.game_id = game_id;
    this.multiplier = multiplier;
    this.time = time;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawStarted): Started {
    return Started.parse(data);
  }

  static parse(data: RawStarted) {
    const props = {
      player_id: data.player_id.value,
      game_id: Number(data.game_id.value),
      multiplier: Number(data.multiplier.value),
      time: Number(data.time.value),
    };
    return new Started(
      props.player_id,
      props.game_id,
      props.multiplier,
      props.time,
    );
  }

  static dedupe(starteds: Started[]): Started[] {
    return starteds.filter(
      (started, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === started.player_id && t.game_id === started.game_id,
        ),
    );
  }

  static getId(started: Started): string {
    return `${started.player_id}-${started.game_id}`;
  }

  hasExpired(): boolean {
    // Event expires in 30 seconds
    return this.time + 30 < Math.floor(Date.now() / 1000);
  }

  getEvent(): EventProps {
    return {
      username: this.player_id,
      multiplier: this.multiplier,
      earning: undefined,
      timestamp: this.time,
      id: Started.getId(this),
    };
  }
}
