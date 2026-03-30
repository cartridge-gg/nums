import { Grid } from "./grid";

const PURPLE = "\ud83d\udfea";
const GREY = "\u2b1c";
const RED = "\ud83d\udfe5";
const ROW_SIZE = 4;

// const PUNCHLINES = [
//   "This shift has been logged. Yours has not.",
//   "Clock in.",
//   "Report for sorting.",
//   "Your sorting quota remains unmet.",
//   "The Sorter is accepting applications.",
//   "Your sequence is due.",
// ];

// const punchline = (): string => {
//   return PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)];
// };

const grid = (slots: number[], number: number): string => {
  const invalidSet = new Set<number>();
  if (number > 0 && slots.some((s) => s === 0)) {
    const alloweds = Grid.alloweds(slots, number);
    if (alloweds.length === 0) {
      const [lower, higher] = Grid.closests(slots, number);
      if (lower !== -1) invalidSet.add(lower);
      if (higher !== -1) invalidSet.add(higher);
    }
  }

  const emojis: string[] = [PURPLE];
  slots.forEach((value, index) => {
    if (value === 0) {
      emojis.push(GREY);
    } else if (invalidSet.has(index)) {
      emojis.push(RED);
    } else {
      emojis.push(PURPLE);
    }
  });
  emojis.push(PURPLE);

  const cols = ROW_SIZE;
  const rowCount = Math.ceil(emojis.length / cols);
  const rows: string[] = [];
  for (let r = 0; r < rowCount; r++) {
    let row = "";
    for (let c = 0; c < cols; c++) {
      const idx = c * rowCount + r;
      if (idx < emojis.length) row += emojis[idx];
    }
    rows.push(row);
  }
  return rows.join("\n");
};

const body = (score?: number, slotCount?: number): string => {
  const total = slotCount ?? 18;
  switch (score) {
    case 1:
      return `Signal negligible.\n1/${total} — within noise margin.`;
    case 2:
      return `Minimal activity logged.\n2/${total} — no pattern detected.`;
    case 3:
      return `Background noise.\n3/${total} — insufficient data for classification.`;
    case 4:
      return `Sub-threshold reading.\n4/${total} — below operational baseline.`;
    case 5:
      return `Partial sequence detected.\n5/${total} — unremarkable.`;
    case 6:
      return `Within expected range.\n6/${total} — no further action required.`;
    case 7:
      return `Standard output.\n7/${total} — file remains inactive.`;
    case 8:
      return `Baseline met.\n8/${total} — operational minimum acknowledged.`;
    case 9:
      return `Moderate coherence.\n9/${total} — the Sorter is aware.`;
    case 10:
      return `Threshold proximity.\n10/${total} — monitoring frequency increased.`;
    case 11:
      return `Flagged.\n11/${total} — review pending.`;
    case 12:
      return `Parameters met.\n12/${total} — minimum compliance confirmed.`;
    case 13:
      return `Surplus detected.\n13/${total} — exceeding minimum parameters.`;
    case 14:
      return `Pattern emerging.\n14/${total} aligned. The Sorter has noted your file.`;
    case 15:
      return `Anomaly detected.\n15/${total} sequenced. Closer observation authorized.`;
    case 16:
      return `Deviation from expected.\n16/${total} — this was not in the model.`;
    case 17:
      return `Containment threshold exceeded.\n17/${total} — the model has no precedent for this.`;
    case 18:
      return `[REDACTED].\n18/${total} — 0 errors. No further access permitted.`;
    default:
      return "Sequence interrupted.\nAnomaly status: unresolved.";
  }
};

export const Tweet = {
  gen: (
    id?: number,
    score?: number,
    slots?: number[],
    number?: number,
    href?: string,
  ): string => {
    const url = href ?? window.location.origin + window.location.pathname;
    const parts: string[] = [];
    if (id !== undefined && score !== undefined) {
      const total = slots?.length ?? 18;
      parts.push(`NUMS #${id} \ud83d\udd22 ${score}/${total}`);
    }
    // parts.push(punchline());
    if (slots) {
      parts.push(`${grid(slots, number ?? 0)}`);
    } else {
    }
    parts.push(`${body(score, slots?.length)}\n\ud83d\udd22 @numsgg\n${url}`);
    return parts.join("\n\n");
  },
};
