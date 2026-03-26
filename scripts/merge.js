import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATE = "20260326";
const LEGACY_TIER_1 = 5_000;
const LEGACY_TIER_2 = 50_000;

const controllers = JSON.parse(
  readFileSync(join(__dirname, `sns-controllers-${DATE}.json`), "utf-8"),
);
const egs = JSON.parse(
  readFileSync(join(__dirname, `sns-egs-${DATE}.json`), "utf-8"),
);
const legacy = JSON.parse(
  readFileSync(join(__dirname, `sns-legacy-${DATE}.json`), "utf-8"),
);

// account_address -> { username, quantity }
const map = new Map();

function add(address, username, games) {
  const entry = map.get(address);
  if (entry) {
    entry.quantity += games;
    if (!entry.username && username) entry.username = username;
  } else {
    map.set(address, { username: username || null, quantity: games });
  }
}

// 1. Cartridge Controller created before snapshot -> 1 game
for (const c of controllers) {
  add(c.account_address, c.username, 1);
}

// 2. Owned at least 1 EGS NFT before snapshot -> 1 game
for (const e of egs) {
  if (e.quantity >= 1) {
    add(e.account_address, e.username, 1);
  }
}

// 3. Legacy NUMS balance at snapshot -> 1/2/3 games
for (const l of legacy) {
  const balance = Number(BigInt(l.balance) / BigInt(10 ** 18));
  let games;
  if (balance < LEGACY_TIER_1) games = 1;
  else if (balance < LEGACY_TIER_2) games = 2;
  else games = 3;
  add(l.account_address, l.username, games);
}

const snapshot = Array.from(map.entries())
  .map(([account_address, { username, quantity }]) => ({
    account_address,
    username,
    quantity,
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
