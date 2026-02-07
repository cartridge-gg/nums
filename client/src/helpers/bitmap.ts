/**
 * Bitmap helper for bit manipulation operations
 * Equivalent to helpers/bitmap.cairo
 */
export class Bitmap {
  /**
   * Count the number of bits set to 1 in the number
   * @param x - The value for which to count the number of bits set to 1
   * @returns The number of bits set to 1
   */
  static popcount(x: bigint): number {
    let count = 0;
    let value = x;
    while (value > 0n) {
      // Count bits in the lower 32 bits
      const lower32 = Number(value & 0xffffffffn);
      count += this._popcount(lower32);
      value >>= 32n;
    }
    return count;
  }

  /**
   * Get the bit at the specified index
   * @param x - The bitmap
   * @param index - The index of the bit to get
   * @returns The value of the bit at the specified index (0 or 1)
   */
  static get(x: bigint, index: number): number {
    const offset = 1n << BigInt(index);
    return Number((x / offset) % 2n);
  }

  /**
   * Set the bit at the specified index
   * @param x - The bitmap
   * @param index - The index of the bit to set
   * @returns The bitmap with the bit at the specified index set to 1
   */
  static set(x: bigint, index: number): bigint {
    const offset = 1n << BigInt(index);
    const bit = (x / offset) % 2n;
    return x + offset * (1n - bit);
  }

  /**
   * Unset the bit at the specified index
   * @param x - The bitmap
   * @param index - The index of the bit to unset
   * @returns The bitmap with the bit at the specified index set to 0
   */
  static unset(x: bigint, index: number): bigint {
    const offset = 1n << BigInt(index);
    const bit = (x / offset) % 2n;
    return x - offset * bit;
  }

  /**
   * Count the number of bits set to 1 in a u32 number
   * @param x - The value for which to count the number of bits set to 1
   * @returns The number of bits set to 1
   */
  private static _popcount(x: number): number {
    let value = x;
    value -= (value >>> 1) & 0x55555555;
    value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
    value = (value + (value >>> 4)) & 0x0f0f0f0f;
    value += value >>> 8;
    value += value >>> 16;
    return value & 0x3f;
  }
}
