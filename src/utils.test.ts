import { isGameOver } from "./utils";

describe("isGameOver", () => {
  describe("Empty slots", () => {
    it("returns false when all slots are empty", () => {
      expect(isGameOver([0, 0, 0, 0, 0], 5)).toBe(false);
    });
  });

  describe("Insertion validation", () => {
    it("rejects insertion before first element", () => {
      expect(isGameOver([3, 5, 0, 0, 0], 1)).toBe(true);
    });

    it("allows insertion between elements", () => {
      expect(isGameOver([1, 4, 0, 20], 5)).toBe(false);
    });

    it("allows insertion at end", () => {
      expect(isGameOver([1, 3, 5, 7, 0], 10)).toBe(false);
    });
  });

  describe("Duplicate handling", () => {
    it("rejects duplicate numbers", () => {
      expect(isGameOver([1, 3, 5, 7, 0], 3)).toBe(true);
    });
  });

  describe("Partial arrays", () => {
    it("allows valid insertion in partial array", () => {
      expect(isGameOver([2, 0, 0, 0, 10], 5)).toBe(false);
    });

    it("rejects invalid insertion in partial array", () => {
      expect(isGameOver([4, 0, 0, 0, 20], 1)).toBe(true);
    });
  });

  describe("Full array checks", () => {
    it("rejects insertion in completely full array", () => {
      const fullArray = Array.from({ length: 20 }, (_, i) => i + 1);
      expect(isGameOver(fullArray, 21)).toBe(true);
    });

    it("handles last slot availability", () => {
      const lastSlotOpen = [...Array(19).keys(), 0];
      expect(isGameOver(lastSlotOpen, 21)).toBe(false);
    });

    it("rejects invalid insertion despite empty slot", () => {
      expect(isGameOver([...Array(18).keys(), 0, 666], 999)).toBe(true);
    });
  });

  describe("Boundary conditions", () => {
    it("rejects insertion when no valid position exists", () => {
      expect(isGameOver([1, 4, 0, 20], 3)).toBe(true);
    });

    it("handles maximum slot count", () => {
      const maxSlots = Array(20)
        .fill(0)
        .map((_, i) => i + 1);
      expect(isGameOver(maxSlots, 21)).toBe(true);
    });
  });

  describe("Msc", () => {
    it("returns false", () => {
      expect(
        isGameOver(
          [138, 198, 0, 228, 0, 0, 0, 396, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          85,
        ),
      ).toBe(true);
    });

    it("returns false", () => {
      expect(
        isGameOver(
          [
            62, 0, 127, 278, 290, 338, 373, 409, 450, 505, 0, 619, 657, 678,
            697, 0, 865, 905, 932, 0,
          ],
          283,
        ),
      ).toBe(true);
    });
  });
});
