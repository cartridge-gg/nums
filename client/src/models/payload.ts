import type { RawPayload } from "@/models";

const MODEL_NAME = "Payload";
const UINT_128 = 1n << 128n;

const uint256ToCalldata = (value: bigint): [string, string] => {
  const low = value % UINT_128;
  const high = value / UINT_128;
  return [low.toString(), high.toString()];
};

export class Payload {
  type = MODEL_NAME;

  constructor(
    public game_id: number,
    public player: string,
    public multiplier: bigint,
    public supply: bigint,
    public price: bigint,
    public level: number,
    public reward: bigint,
  ) {
    this.game_id = game_id;
    this.player = player;
    this.multiplier = multiplier;
    this.supply = supply;
    this.price = price;
    this.level = level;
    this.reward = reward;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawPayload): Payload {
    return Payload.parse(data);
  }

  static parse(data: RawPayload) {
    return new Payload(
      Number(data.game_id.value),
      data.player.value,
      BigInt(data.multiplier.value),
      BigInt(data.supply.value),
      BigInt(data.price.value),
      Number(data.level.value),
      BigInt(data.reward.value),
    );
  }

  static dedupe(payloads: Payload[]): Payload[] {
    return payloads.filter(
      (payload, index, self) =>
        index ===
        self.findIndex(
          (item) =>
            item.game_id === payload.game_id &&
            BigInt(item.player) === BigInt(payload.player) &&
            item.level === payload.level &&
            item.reward === payload.reward,
        ),
    );
  }

  static getUuid(payload: Payload): string {
    return `${payload.player}-${payload.game_id}-${payload.level}-${payload.reward}`;
  }

  isReverse(): boolean {
    return this.level > 0 || this.reward > 0n;
  }

  toCalldata(): string[] {
    const supply = uint256ToCalldata(this.supply);
    const price = uint256ToCalldata(this.price);

    return [
      this.game_id.toString(),
      this.player,
      this.multiplier.toString(),
      ...supply,
      ...price,
      this.level.toString(),
      this.reward.toString(),
    ];
  }

  rewardAmount(): number {
    return Number(this.reward / 10n ** 18n);
  }
}
