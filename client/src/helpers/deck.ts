/**
 * Deck struct and random card drawing methods
 * Equivalent to helpers/deck.cairo
 */

import { hash } from "starknet";

const TWO_POW_1 = 0x2n;
const MASK_1 = 0x1n;

export class Deck {
  private seed: bigint;
  private keys: Map<bigint, bigint>;
  private cards: Map<bigint, number>;
  public remaining: number;
  private nonce: number;

  constructor(seed: bigint, number: number) {
    this.seed = seed;
    this.keys = new Map();
    this.cards = new Map();
    this.remaining = number;
    this.nonce = 0;
  }

  /**
   * Create a new deck
   * Equivalent to new in Cairo
   */
  static new(seed: bigint, number: number): Deck {
    return new Deck(seed, number);
  }

  /**
   * Create a deck from a bitmap
   * Equivalent to from_bitmap in Cairo
   */
  static fromBitmap(seed: bigint, number: number, bitmap: bigint): Deck {
    if (number > 128) {
      throw new Error("Deck: too many cards");
    }
    const deck = new Deck(seed, number);
    let card = 1;
    let bitmapValue = bitmap;
    while (bitmapValue !== 0n && card <= number) {
      if ((bitmapValue & MASK_1) === 1n) {
        deck.withdraw(card);
      }
      bitmapValue = bitmapValue / TWO_POW_1;
      card += 1;
    }
    return deck;
  }

  /**
   * Draw a card from the deck
   * Equivalent to draw in Cairo
   */
  draw(): number {
    // [Check] Enough cards left
    if (this.remaining <= 0) {
      throw new Error("Deck: no cards left");
    }

    // [Compute] Draw a random card from remaining cards
    const state = this.poseidonHash([
      this.seed,
      BigInt(this.nonce),
      BigInt(this.remaining),
    ]);
    const random = state;
    const key = ((random % BigInt(this.remaining)) + 1n) as bigint;

    let card = this.cards.get(key) ?? 0;
    if (card === 0) {
      card = Number(key);
    }

    // [Compute] Remove card from the deck
    this.withdraw(card);
    this.nonce += 1;
    return card;
  }

  /**
   * Discard a card back into the deck
   * Equivalent to discard in Cairo
   */
  discard(card: number): void {
    this.remaining += 1;
    this.cards.set(BigInt(this.remaining), card);
  }

  /**
   * Withdraw a card from the deck
   * Equivalent to withdraw in Cairo
   */
  withdraw(card: number): void {
    let key = this.keys.get(BigInt(card)) ?? 0n;
    if (key === 0n) {
      key = BigInt(card);
    }
    const latestKey = BigInt(this.remaining);
    if (latestKey !== key) {
      let latestCard = this.cards.get(latestKey) ?? 0;
      if (latestCard === 0) {
        latestCard = Number(latestKey);
      }
      this.cards.set(key, latestCard);
      this.keys.set(BigInt(latestCard), key);
    }
    this.remaining -= 1;
  }

  /**
   * Remove multiple cards from the deck
   * Equivalent to remove in Cairo
   */
  remove(cards: number[]): void {
    for (const card of cards) {
      this.withdraw(card);
    }
  }

  /**
   * Poseidon hash function
   * Equivalent to PoseidonTrait::finalize in helpers/deck.cairo
   */
  private poseidonHash(inputs: bigint[]): bigint {
    const hashResult = hash.computePoseidonHashOnElements(inputs);
    return BigInt(hashResult);
  }
}
