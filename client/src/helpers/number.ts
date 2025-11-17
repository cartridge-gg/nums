export const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    const formatted = value / 1_000_000_000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}B`;
  }

  if (absValue >= 1_000_000) {
    const formatted = value / 1_000_000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    const formatted = value / 1_000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}K`;
  }

  return value.toLocaleString();
};

export const formatScore8Digits = (value: number): string => {
  const valueString = value.toLocaleString();
  const digitCount = valueString
    .split("")
    .filter((char) => /^\d$/.test(char)).length;
  return valueString.padStart(8 + valueString.length - digitCount, " ");
};
