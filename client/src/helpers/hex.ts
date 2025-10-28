/**
 * Converts a number to a hexadecimal string with uint64 format (16 chars)
 * @param value - The number to convert
 * @returns Hexadecimal string with 0x prefix and zero-padding to 16 chars
 * 
 * @example
 * toHexUint64(1) // "0x0000000000000001"
 * toHexUint64(255) // "0x00000000000000ff"
 * toHexUint64(4096) // "0x0000000000001000"
 */
export const toHexUint64 = (value: number): string => {
  // Convert to hex without 0x prefix
  const hex = value.toString(16);
  
  // Pad with zeros to reach 16 characters (uint64)
  const padded = hex.padStart(16, '0');
  
  return `0x${padded}`;
};

/**
 * Converts a number to a hexadecimal string with uint256 format (64 chars)
 * @param value - The number to convert
 * @returns Hexadecimal string with 0x prefix and zero-padding to 64 chars
 * 
 * @example
 * toHexUint256(1) // "0x0000000000000000000000000000000000000000000000000000000000000001"
 */
export const toHexUint256 = (value: number): string => {
  // Convert to hex without 0x prefix
  const hex = value.toString(16);
  
  // Pad with zeros to reach 64 characters (uint256)
  const padded = hex.padStart(64, '0');
  
  return `0x${padded}`;
};

/**
 * Converts a hex string to a number
 * @param hex - Hexadecimal string (with or without 0x prefix)
 * @returns The number value
 * 
 * @example
 * fromHex("0x0000000000000001") // 1
 * fromHex("0x00000000000000ff") // 255
 * fromHex("ff") // 255
 */
export const fromHex = (hex: string): number => {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return parseInt(cleanHex, 16);
};

