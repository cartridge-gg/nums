import { Verifier } from "./verifier";

describe("Verifier", () => {
  describe("isOver", () => {
    test("test_is_over_all_slots_filled", () => {
      const slots = [10, 20, 30, 40, 50];
      expect(Verifier.isOver(60, 5, 5, slots)).toBe(true);
    });

    test("test_is_over_game_not_started", () => {
      const slots = [0, 0, 0, 0, 0];
      expect(Verifier.isOver(0, 0, 5, slots)).toBe(false);
    });

    test("test_is_over_empty_slot_at_end_can_fit", () => {
      const slots = [10, 20, 30, 40, 0];
      expect(Verifier.isOver(500, 4, 5, slots)).toBe(false);
    });

    test("test_is_over_empty_slot_at_end_cannot_fit", () => {
      const slots = [10, 20, 30, 40, 50];
      expect(Verifier.isOver(60, 4, 5, slots)).toBe(true);
    });

    test("test_is_over_empty_slot_at_beginning_can_fit", () => {
      const slots = [0, 20, 30, 40, 50];
      expect(Verifier.isOver(5, 4, 5, slots)).toBe(false);
    });

    test("test_is_over_empty_slot_in_middle_can_fit", () => {
      const slots = [10, 20, 0, 40, 50];
      expect(Verifier.isOver(30, 4, 5, slots)).toBe(false);
    });

    test("test_is_over_empty_slot_in_middle_cannot_fit", () => {
      // Number 35 can fit between 20 and 40, so game is not over
      const slots = [10, 20, 0, 40, 50];
      expect(Verifier.isOver(35, 4, 5, slots)).toBe(false);

      // Number 45 cannot fit in the gap (too large), so game is over
      const slots2 = [10, 20, 0, 40, 50];
      expect(Verifier.isOver(45, 4, 5, slots2)).toBe(true);
    });

    test("test_is_over_number_smaller_than_first", () => {
      const slots = [10, 20, 30, 40, 50];
      expect(Verifier.isOver(5, 5, 5, slots)).toBe(true);
    });

    test("test_is_over_gaps_between_numbers", () => {
      const slots = [10, 50, 0, 100, 200];
      expect(Verifier.isOver(75, 4, 5, slots)).toBe(false);
    });

    test("test_is_over_only_one_slot_filled", () => {
      const slots = [100, 0, 0, 0, 0];
      expect(Verifier.isOver(500, 1, 5, slots)).toBe(false);
    });

    test("test_is_over_number_between_filled_slots", () => {
      const slots = [10, 20, 30, 40, 50];
      expect(Verifier.isOver(25, 5, 5, slots)).toBe(true);
    });

    test("test_is_over_multiple_empty_slots_valid", () => {
      const slots = [10, 0, 0, 40, 50];
      expect(Verifier.isOver(25, 3, 5, slots)).toBe(false);
    });
  });

  describe("isValid", () => {
    test("test_is_valid_single_element", () => {
      const slots = [42];
      expect(Verifier.isValid(slots)).toBe(true);
    });

    test("test_is_valid_empty_array", () => {
      const slots = [0, 0, 0, 0, 0];
      expect(Verifier.isValid(slots)).toBe(true);
    });

    test("test_is_valid_ascending_order", () => {
      const slots = [1, 5, 10, 15, 20];
      expect(Verifier.isValid(slots)).toBe(true);
    });

    test("test_is_valid_not_ascending", () => {
      const slots = [10, 5, 15, 20];
      expect(Verifier.isValid(slots)).toBe(false);
    });

    test("test_is_valid_equal_elements", () => {
      const slots = [5, 5, 10, 15];
      expect(Verifier.isValid(slots)).toBe(true);
    });

    test("test_is_valid_with_empty_slots", () => {
      const slots = [10, 0, 30, 0, 50];
      expect(Verifier.isValid(slots)).toBe(true);
    });

    test("test_is_valid_descending_order", () => {
      const slots = [50, 40, 30, 20, 10];
      expect(Verifier.isValid(slots)).toBe(false);
    });
  });

  describe("streak", () => {
    test("test_streak_several", () => {
      const slots = [
        1, 2, 3, 0, 0, 7, 8, 9, 0, 0, 12, 0, 14, 0, 16, 0, 18, 0, 20,
      ];
      expect(Verifier.streak(slots)).toBe(3);
    });

    test("test_streak_none", () => {
      const slots = [
        1, 0, 3, 0, 5, 0, 7, 0, 9, 0, 11, 0, 13, 0, 15, 0, 17, 0, 19, 0,
      ];
      expect(Verifier.streak(slots)).toBe(1);
    });

    test("test_streak_full", () => {
      const slots = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ];
      expect(Verifier.streak(slots)).toBe(20);
    });

    test("test_streak_single_number", () => {
      const slots = [100, 0, 0, 0, 0];
      expect(Verifier.streak(slots)).toBe(1);
    });

    test("test_streak_multiple_streaks", () => {
      const slots = [1, 2, 3, 0, 5, 6, 7, 8, 0, 10, 11];
      expect(Verifier.streak(slots)).toBe(4);
    });

    test("test_streak_empty_array", () => {
      const slots = [0, 0, 0, 0, 0];
      expect(Verifier.streak(slots)).toBe(0);
    });
  });
});
