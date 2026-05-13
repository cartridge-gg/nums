import { describe, expect, test } from "vitest";
import { Payload } from "./payload";

describe("Payload", () => {
  test("serializes in Cairo Payload serde order", () => {
    const payload = new Payload(
      42,
      "0x123",
      1_500_000n,
      (3n << 128n) + 7n,
      (2n << 128n) + 5n,
      12,
      29_000n * 10n ** 18n,
    );

    expect(payload.toCalldata()).toEqual([
      "42",
      "0x123",
      "1500000",
      "7",
      "3",
      "5",
      "2",
      "12",
      "29000000000000000000000",
    ]);
  });

  test("treats finished-game payloads as reverse bridge messages", () => {
    expect(new Payload(1, "0x1", 1n, 0n, 0n, 0, 0n).isReverse()).toBe(false);
    expect(new Payload(1, "0x1", 1n, 0n, 0n, 1, 0n).isReverse()).toBe(true);
    expect(new Payload(1, "0x1", 1n, 0n, 0n, 0, 1n).isReverse()).toBe(true);
  });
});
