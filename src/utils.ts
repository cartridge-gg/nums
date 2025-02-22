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
  if (slots.every((slot) => !slot)) {
    return false;
  }

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

export function isMoveLegal(
  slots: number[],
  number: number,
  index: number,
): boolean {
  if (slots[index] !== 0) {
    return false;
  }

  const nonZeroBefore = slots.slice(0, index).filter((x) => x !== 0);
  const nonZeroAfter = slots.slice(index + 1).filter((x) => x !== 0);

  if (
    (nonZeroBefore.length > 0 &&
      number < nonZeroBefore[nonZeroBefore.length - 1]) ||
    (nonZeroAfter.length > 0 && number > nonZeroAfter[0])
  ) {
    return false;
  }

  if (slots.includes(number)) {
    return false;
  }

  return true;
}
