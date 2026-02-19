import type { RawPurchased } from "@/models";

const MODEL_NAME = "Purchased";

export class Purchased {
  type = MODEL_NAME;

  constructor(
    public player_id: string,
    public starterpack_id: number,
    public quantity: number,
    public multiplier: number,
    public time: number,
  ) {
    this.player_id = player_id;
    this.starterpack_id = starterpack_id;
    this.quantity = quantity;
    this.multiplier = multiplier;
    this.time = time;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawPurchased): Purchased {
    return Purchased.parse(data);
  }

  static parse(data: RawPurchased) {
    const props = {
      player_id: data.player_id.value,
      starterpack_id: Number(data.starterpack_id.value),
      quantity: Number(data.quantity.value),
      multiplier: Number(data.multiplier.value),
      time: Number(data.time.value),
    };
    return new Purchased(
      props.player_id,
      props.starterpack_id,
      props.quantity,
      props.multiplier,
      props.time,
    );
  }

  static dedupe(purchaseds: Purchased[]): Purchased[] {
    return purchaseds.filter(
      (purchased, index, self) =>
        index === self.findIndex((t) => t.player_id === purchased.player_id && t.time === purchased.time),
    );
  }

  static getId(purchased: Purchased): string {
    return `${purchased.player_id}-${purchased.starterpack_id}-${purchased.time}`;
  }
}
