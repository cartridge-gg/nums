import { BigNumberish, num } from "starknet";

export function formatAddress(addr: BigNumberish) {
  if (typeof addr === "number") {
    addr = "0x" + addr.toString(16);
  } else {
    addr = num.toHex(BigInt(addr));
  }

  return addr.substr(0, 6) + "..." + addr.substr(-4);
}

export function removeZeros(addr: string) {
  if (addr.startsWith("0x")) {
    addr = addr.slice(2);
  }

  return "0x" + addr.replace(/^0+/, "");
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export function isGameOver(slots: number[], nextNumber: number) {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === 0) {
      const temp = [...slots];
      temp[i] = nextNumber;
      const nonZeros = temp.filter((x) => x !== 0);
      let isSorted = true;
      for (let j = 1; j < nonZeros.length; j++) {
        if (nonZeros[j] < nonZeros[j - 1]) {
          isSorted = false;
          break;
        }
      }
      if (isSorted) {
        return false;
      }
    }
  }
  return true;
}
