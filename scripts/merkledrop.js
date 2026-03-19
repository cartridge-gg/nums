import { readFileSync } from "fs";
import { createInterface } from "readline";
import { scryptSync, createDecipheriv } from "crypto";
import { RpcProvider, Account, CallData } from "starknet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";

const manifest = JSON.parse(
  readFileSync(join(ROOT, "manifest_sepolia.json"), "utf-8"),
);
const CONTRACT_ADDRESS = manifest.contracts.find(
  (c) => c.tag === "NUMS-Play",
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
  readFileSync(join(ROOT, "account_sepolia.json"), "utf-8"),
);
const accountAddress = accountData.deployment.address;

const password = await promptPassword();
const privateKey = decryptKeystore(
  join(ROOT, "keystore_sepolia.json"),
  password,
);

const provider = new RpcProvider({ nodeUrl: RPC_URL });
const account = new Account({
  provider,
  address: accountAddress,
  signer: privateKey,
});

const snapshot = JSON.parse(
  readFileSync(join(__dirname, "snapshot.json"), "utf-8"),
);

const sorted = [...snapshot].sort((a, b) => {
  const balA = BigInt(a.balance);
  const balB = BigInt(b.balance);
  if (balB > balA) return 1;
  if (balB < balA) return -1;
  return 0;
});

const data = sorted.map((user, i) => {
  let count;
  if (i < 50) count = 5;
  else if (i < 100) count = 4;
  else if (i < 150) count = 3;
  else if (i < 200) count = 2;
  else count = 1;
  return [user.account_address, count.toString()];
});

const expiration = 1782856800;
const calldata = CallData.compile([data, expiration]);

console.error(`Account: ${accountAddress}`);
console.error(`Contract: ${CONTRACT_ADDRESS} (NUMS-Play)`);
console.error(`Users: ${data.length}`);
console.error(`Sending merkledrop_register...`);

const tx = await account.execute({
  contractAddress: CONTRACT_ADDRESS,
  entrypoint: "merkledrop_register",
  calldata,
});

console.error(`Tx hash: ${tx.transaction_hash}`);
console.error("Waiting for confirmation...");

await provider.waitForTransaction(tx.transaction_hash);
console.error("Confirmed!");
