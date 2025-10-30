/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { LeaderboardModel } from "./leaderboard";

// Test constants matching the Cairo contract
const TOURNAMENT_ID = 1;
const MAX_CAPACITY = 5;

describe("LeaderboardModel.getCapacity", () => {
  it("should calculate capacity with no games", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      MAX_CAPACITY,
      0,
      [],
    );

    // No games
    expect(leaderboard.getCapacity(0)).toBe(0);
    expect(leaderboard.getCapacity(1)).toBe(0);
    expect(leaderboard.getCapacity(5)).toBe(0);
    expect(leaderboard.getCapacity(10)).toBe(0);
    expect(leaderboard.getCapacity(30)).toBe(0);
    expect(leaderboard.getCapacity(40)).toBe(0);
    expect(leaderboard.getCapacity(41)).toBe(0);
    expect(leaderboard.getCapacity(100)).toBe(0);
  });

  it("should calculate capacity with one game", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      MAX_CAPACITY,
      0,
      [1],
    );

    // One game
    expect(leaderboard.getCapacity(1)).toBe(1);
    expect(leaderboard.getCapacity(5)).toBe(1);
    expect(leaderboard.getCapacity(10)).toBe(1);
    expect(leaderboard.getCapacity(30)).toBe(1);
    expect(leaderboard.getCapacity(40)).toBe(1);
    expect(leaderboard.getCapacity(41)).toBe(1);
    expect(leaderboard.getCapacity(100)).toBe(1);
  });

  it("should calculate capacity with five games", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      MAX_CAPACITY,
      0,
      [1, 2, 3, 4, 5],
    );

    // Five games
    expect(leaderboard.getCapacity(5)).toBe(2);
    expect(leaderboard.getCapacity(10)).toBe(2);
    expect(leaderboard.getCapacity(30)).toBe(3);
    expect(leaderboard.getCapacity(40)).toBe(4);
    expect(leaderboard.getCapacity(41)).toBe(5);
    expect(leaderboard.getCapacity(100)).toBe(5);
  });

  it("should calculate capacity with ten games", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      MAX_CAPACITY,
      0,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );

    // Ten games (but max capacity is 5, so limited to 5)
    expect(leaderboard.getCapacity(10)).toBe(2);
    expect(leaderboard.getCapacity(30)).toBe(3);
    expect(leaderboard.getCapacity(40)).toBe(4);
    expect(leaderboard.getCapacity(41)).toBe(5);
    expect(leaderboard.getCapacity(100)).toBe(5);
  });

  it("should respect entry count criteria for low counts", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      MAX_CAPACITY,
      0,
      [1, 2, 3, 4, 5],
    );

    // entry_count < 3 -> 1 winner
    expect(leaderboard.getCapacity(1)).toBe(1);
    expect(leaderboard.getCapacity(2)).toBe(1);

    // entry_count < 11 -> 2 winners
    expect(leaderboard.getCapacity(3)).toBe(2);
    expect(leaderboard.getCapacity(10)).toBe(2);

    // entry_count >= 11 -> (entry_count + 9) / 10
    expect(leaderboard.getCapacity(11)).toBe(2); // (11 + 9) / 10 = 2
    expect(leaderboard.getCapacity(20)).toBe(2); // (20 + 9) / 10 = 2
    expect(leaderboard.getCapacity(21)).toBe(3); // (21 + 9) / 10 = 3
  });

  it("should be limited by games.length", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      MAX_CAPACITY,
      0,
      [1, 2], // Only 2 games
    );

    // Even with many entries, limited by games.length (2)
    expect(leaderboard.getCapacity(100)).toBe(2);
    expect(leaderboard.getCapacity(1000)).toBe(2);
  });

  it("should be limited by capacity", () => {
    const leaderboard = new LeaderboardModel(
      "test",
      TOURNAMENT_ID,
      3, // capacity is only 3
      0,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 10 games
    );

    // Even with 10 games and many entries, limited by capacity (3)
    expect(leaderboard.getCapacity(100)).toBe(3);
    expect(leaderboard.getCapacity(1000)).toBe(3);
  });
});
