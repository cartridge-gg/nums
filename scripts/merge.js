import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATE = "20260326";
const MAX_QUANTITY = 3;

const snapshots = [
  JSON.parse(readFileSync(join(__dirname, `sns-egs-${DATE}.json`), "utf-8")),
  JSON.parse(readFileSync(join(__dirname, `sns-nums-${DATE}.json`), "utf-8")),
  JSON.parse(readFileSync(join(__dirname, `sns-flip-${DATE}.json`), "utf-8")),
  JSON.parse(readFileSync(join(__dirname, `sns-lords-${DATE}.json`), "utf-8")),
  JSON.parse(readFileSync(join(__dirname, `sns-papers-${DATE}.json`), "utf-8")),
];

// account_address -> { username, total }
const map = new Map();

for (const entries of snapshots) {
  for (const entry of entries) {
    const existing = map.get(entry.account_address);
    if (existing) {
      existing.total += 1;
      if (!existing.username && entry.username)
        existing.username = entry.username;
    } else {
      map.set(entry.account_address, {
        username: entry.username || null,
        total: 1,
      });
    }
  }
}

const snapshot = Array.from(map.entries())
  .map(([account_address, { username, total }]) => ({
    account_address,
    username,
    total,
    quantity: Math.min(total, MAX_QUANTITY),
  }))
  .sort(
    (a, b) =>
      b.quantity - a.quantity ||
      a.account_address.localeCompare(b.account_address),
  );

const outPath = join(__dirname, `snapshot-${DATE}.json`);
writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n");

console.log(`Total: ${snapshot.length} controllers`);
console.log(
  `Games: ${snapshot.reduce((sum, s) => sum + s.quantity, 0)} free games`,
);
console.log(`Output: ${outPath}`);
