import { readFileSync } from "fs";
import { createInterface } from "readline";
import { scryptSync, createDecipheriv } from "crypto";
import { RpcProvider, Account, CallData } from "starknet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const NETWORK = "sepolia";
const RPC_URL = `https://api.cartridge.gg/x/starknet/${NETWORK}`;

const manifest = JSON.parse(
  readFileSync(join(ROOT, `manifest_${NETWORK}.json`), "utf-8"),
);
const CONTRACT_ADDRESS = manifest.contracts.find(
  (c) => c.tag === "NUMS-Setup",
).address;

function promptPassword() {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    rl.question("Keystore password: ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function decryptKeystore(keystorePath, password) {
  const keystore = JSON.parse(readFileSync(keystorePath, "utf-8"));
  const { crypto: c } = keystore;

  const salt = Buffer.from(c.kdfparams.salt, "hex");
  const iv = Buffer.from(c.cipherparams.iv, "hex");
  const ciphertext = Buffer.from(c.ciphertext, "hex");

  const { n, r, p, dklen } = c.kdfparams;
  const derivedKey = scryptSync(Buffer.from(password), salt, dklen, {
    N: n,
    r,
    p,
  });

  const decipher = createDecipheriv(
    "aes-128-ctr",
    derivedKey.subarray(0, 16),
    iv,
  );
  const privateKey = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return "0x" + privateKey.toString("hex");
}

const accountData = JSON.parse(
  readFileSync(join(ROOT, `account_${NETWORK}.json`), "utf-8"),
);
const accountAddress = accountData.deployment.address;

const password = await promptPassword();
const privateKey = decryptKeystore(
  join(ROOT, `keystore_${NETWORK}.json`),
  password,
);

const provider = new RpcProvider({ nodeUrl: RPC_URL });
const account = new Account({
  provider,
  address: accountAddress,
  signer: privateKey,
});

const CHUNK_SIZE = 900;
const DELAY_MS = 5_000;

const snapshot = JSON.parse(
  readFileSync(join(__dirname, "snapshot-20260326.json"), "utf-8"),
);

const data = snapshot.map((user) => [
  user.account_address,
  user.quantity.toString(),
]);

const expiration = 1782864000;
const chunks = [];
for (let i = 0; i < data.length; i += CHUNK_SIZE) {
  chunks.push(data.slice(i, i + CHUNK_SIZE));
}

console.error(`Account: ${accountAddress}`);
console.error(`Contract: ${CONTRACT_ADDRESS} (NUMS-Setup)`);
console.error(`Users: ${data.length}`);
console.error(`Chunks: ${chunks.length} x ${CHUNK_SIZE}`);

for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];
  const calldata = CallData.compile([chunk, expiration]);

  console.error(
    `\n[${i + 1}/${chunks.length}] Sending ${chunk.length} users...`,
  );

  const tx = await account.execute({
    contractAddress: CONTRACT_ADDRESS,
    entrypoint: "merkledrop_register",
    calldata,
  });

  console.error(`Tx hash: ${tx.transaction_hash}`);
  console.error("Waiting for confirmation...");

  await provider.waitForTransaction(tx.transaction_hash);
  console.error("Confirmed!");

  if (i < chunks.length - 1) {
    console.error(`Waiting ${DELAY_MS / 1000}s before next batch...`);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
}

console.error(`\nDone! ${chunks.length} batches registered.`);
