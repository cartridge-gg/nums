# Nums bridge — Docker Compose deployment

End-to-end orchestration for a real Nums bridge that settles on
**Starknet Sepolia**. One `docker compose up` produces:

- A long-running Katana node acting as the **appchain** (rollup mode).
- A long-running `saya-tee` proving every appchain block and submitting
  state roots to a Piltover core deployed on Sepolia.
- All Cairo contracts migrated and wired on both chains (Setup, Play,
  Collection, Vault, Token, Treasury, plus the Piltover core and the
  AMD TEE registry mock on Sepolia).

The TEE pipeline runs in **mock-prove mode** (no SEV-SNP hardware
required). See [`docs/SAYA_TEE_SETUP.md`](../docs/SAYA_TEE_SETUP.md)
for the rationale; the same approach is used by `tests/e2e/`.

## Prerequisites

- Docker and `docker compose` (compose plugin v2.20+ — we use
  `service_completed_successfully` and named bind-volumes).
- A Starknet Sepolia account with **≥5 STRK** in its balance (covers
  the Piltover deploy + Dojo migrate; the bootstrap aborts early on
  `out of funds`).

## One-time setup

```sh
cp deploy/.env.sample deploy/.env
# Edit deploy/.env: fill in SEPOLIA_DEPLOYER_ADDRESS,
# SEPOLIA_DEPLOYER_PRIVATE_KEY, and SEPOLIA_PROVER_PRIVATE_KEY.
```

## Run

From the repo root:

```sh
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up
```

Stage-by-stage logs land on the same console (`bootstrap-settlement →
katana → configure-piltover → migrate → saya`). Expected wall-clock
on a fast connection: ~15 minutes; the long tail is the `sozo migrate`
on Sepolia.

When `saya` starts logging `Chain advanced to new block`, the bridge
is live. The appchain RPC is reachable at `http://localhost:5050`
from the host.

## Idempotency / restart / reset

- **Restart**: `docker compose down && docker compose up` — Katana
  data and Saya's attestation DB are kept in named volumes, so
  restarts pick up where they left off. The bootstrap stage flag
  files short-circuit Stages A–C; nothing redeploys.
- **Reset** (wipes EVERYTHING — costs Sepolia gas on next `up`):
  ```sh
  docker compose -f deploy/docker-compose.yml --env-file deploy/.env down -v
  ```

## What the stack does

```
bootstrap-settlement   one-shot  Stage A
  └─ katana            long      Stage B.1   waits for Stage A
       └─ configure-piltover  one-shot  Stage B.2   waits for Katana healthy
            └─ migrate    one-shot  Stage C       waits for B.2
                 └─ saya  long      Stage D       waits for C
```

| Stage | What runs | Cost (Sepolia gas) |
|---|---|---|
| A | `saya-ops declare-and-deploy-tee-registry-mock` + `katana init rollup` (declares + deploys Piltover core) | ~0.2 STRK |
| B.1 | `katana --chain ... --tee mock` (long-running) | 0 |
| B.2 | `set_program_info(KatanaTee { hash })` on Piltover | ~0.01 STRK |
| C | `sozo migrate` on both chains, `Setup.set_bridge` on both, `Vault.deposit` seed | ~2–5 STRK |
| D | `saya-tee tee start --mock-prove` (long-running, batches one block per submit) | per-block gas ongoing |

## Files

- `docker-compose.yml` — service definitions, volumes, healthchecks.
- `Dockerfile.tools` — builder image with every CLI we need (katana,
  saya-tee, saya-ops, sozo, scarb, starkli, jq).
- `Dockerfile.katana` / `Dockerfile.saya` — thin runtime images that
  copy the relevant binaries out of `tools`.
- `scripts/` — bash translations of `tests/e2e/src/harness.rs`'s
  `TestEnv::start` for use inside the containers.
- `templates/` — Dojo profile templates rendered against the
  bootstrap-generated addresses.

## Pitfalls

- **Class hash equality**: Dojo's address derivation depends on the
  Play class hash. `scripts/03_migrate_worlds.sh` re-runs the same
  `force_play_artifacts_match` workaround the e2e harness uses
  (`harness.rs:321`); if Dojo's Sierra non-determinism gets fixed
  upstream, drop the copy step.
- **`--tee mock` is dev-only**: Same caveat as in
  `docs/SAYA_TEE_SETUP.md`. Production needs SEV-SNP hardware and a
  real Piltover TEE registry. Don't ship the mock registry to mainnet.
- **Sepolia gas spikes**: bursty migrate txs sometimes hit the
  free-RPC rate limit. If you see `429`s in `migrate` logs, retry —
  the script is restart-safe (Dojo's manifests are append-only).
- **Saya version**: `Dockerfile.saya` + `Dockerfile.tools` pull
  `saya-tee`/`saya-ops` binaries from `ghcr.io/dojoengine/saya:v0.4.0`
  (pinned via `SAYA_VERSION` build-arg). If a future
  `saya-tee` regresses `compute_l1_to_l2_msg_hash` and you see
  `'tee: invalid messages'` from Piltover on message-carrying blocks,
  pin `SAYA_VERSION` to a known-good build and apply
  `deploy/patches/saya-l1-handler-hash.patch` via a custom build stage.
