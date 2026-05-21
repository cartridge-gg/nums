# Nums bridge — Sepolia-settled local deploy

Four bash scripts. No docker, no compose, no templates.

End state: a local appchain Katana settling to Sepolia via `saya-tee`
(mock-prove), with Torii indexing the appchain world for the React
client.

## Prerequisites

Binaries on `PATH`: `katana`, `sozo`, `saya-tee`, `saya-ops`, `torii`,
plus `scarb` and `jq`.

Sepolia deployer with **≥5 STRK** (covers `sozo migrate` + ongoing
`saya-tee` state submits).

```sh
cp deploy/.env.sample deploy/.env
# Fill in SEPOLIA_DEPLOYER_PRIVATE_KEY and SEPOLIA_PROVER_PRIVATE_KEY
source deploy/.env
```

Everything else (RPC URL, deployer address, Piltover address, world
seed, TEE registry salt) is hardcoded inside the scripts.

## Run

Each script blocks; run them in separate terminals (or `tmux` / `nohup`).

```sh
# Terminal 1 — appchain Katana. Bootstraps Piltover + TEE registry on
# first run if deploy/chain-config/ is missing.
bash deploy/scripts/katana.sh

# Terminal 2 — sozo build + migrate both worlds, then wire the bridge
# and seed the settlement Vault. One-shot.
bash deploy/scripts/migrate.sh

# Terminal 3 — saya-tee in mock-prove mode.
bash deploy/scripts/saya.sh

# Terminal 4 — Torii indexer for the appchain world.
bash deploy/scripts/torii.sh
```

When `saya.sh` starts logging `Chain advanced to new block`, the bridge
is live. Host endpoints:

- Appchain RPC:  `http://localhost:6969`
- Appchain Torii: `http://localhost:8080`

## Files

- `scripts/katana.sh` — appchain Katana + first-run bootstrap.
- `scripts/migrate.sh` — `sozo migrate` both worlds + bridge wiring.
- `scripts/saya.sh` — long-running saya-tee.
- `scripts/torii.sh` — long-running Torii indexer.
- `chain-config/` — committed rollup chain spec (config.toml +
  genesis.json). Used by `katana.sh` to start the appchain. The genesis
  keypair is dev-only and committed intentionally.
- `../dojo_settlement.toml` / `../dojo_appchain.toml` — committed Dojo
  profiles. The deployer `private_key` is read by sozo from the
  `DOJO_PRIVATE_KEY` env var (sourced in `migrate.sh`); the appchain
  genesis keypair is inlined (local-dev chain only).

## Pitfalls

- **First-run bootstrap**: if `deploy/chain-config/` is missing, the
  Katana script deploys Piltover on Sepolia and runs `katana init
  rollup` to populate it. That generates a fresh appchain genesis
  keypair, so `dojo_appchain.toml`'s inlined `account_address` /
  `private_key` will be stale — copy the new values out of
  `deploy/chain-config/genesis.json` before running `migrate.sh`.
- **Re-running `migrate.sh`** is safe: Dojo's manifests are
  append-only and the multicall is idempotent. Side effect — the Vault
  gets a second 1 NUMS deposit per run, which is benign (the seed only
  needs `total_shares != 0`).
- **Sepolia gas spikes** sometimes return bogus fee estimates from the
  RPC right after a parallel sozo migrate burst. Re-running the failed
  step is the fix.
- **`--tee mock` is dev-only**. Production needs SEV-SNP hardware and a
  real Piltover TEE registry.

## Client

To run the React client against this stack, alias the appchain as
"Sepolia" inside the UI (the client only knows `SN_MAIN` and
`SN_SEPOLIA`):

```sh
cp manifest_appchain.json manifest_sepolia.json

cat > client/.env <<'EOF'
VITE_DEFAULT_CHAIN=SN_SEPOLIA
VITE_SN_SEPOLIA_RPC_URL=http://localhost:6969
VITE_SN_SEPOLIA_TORII_URL=http://localhost:8080
VITE_SN_SEPOLIA_VRF=0x0
EOF

pnpm install
pnpm dev   # http://localhost:1337
```
