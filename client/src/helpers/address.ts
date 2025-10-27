export const shortAddress = (address: string) => {
  const addr = BigInt(address).toString(16);
  return (
    "0x" +
    addr.substring(0, 4) +
    "..." +
    addr.substring(addr.length - 4, addr.length)
  );
};
