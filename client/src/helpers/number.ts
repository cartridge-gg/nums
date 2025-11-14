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
