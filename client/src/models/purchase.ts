import type { RawPurchase } from "@/models";

const MODEL_NAME = "Purchase";

export class Purchase {
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

  static from(data: RawPurchase): Purchase {
    return Purchase.parse(data);
  }

  static parse(data: RawPurchase) {
    const props = {
      player_id: data.player_id.value,
      starterpack_id: Number(data.starterpack_id.value),
      quantity: Number(data.quantity.value),
      multiplier: Number(data.multiplier.value),
      time: Number(data.time.value),
    };
    return new Purchase(
      props.player_id,
      props.starterpack_id,
      props.quantity,
      props.multiplier,
      props.time,
    );
  }
}
