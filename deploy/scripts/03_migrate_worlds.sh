#!/usr/bin/env bash
# Stage C — migrate
#
# Renders the Dojo profile TOMLs against the bootstrap-produced
# addresses, then `sozo build` + `sozo migrate` against both chains.
# Finally seeds the settlement Vault so the first `Play.claim` doesn't
# trip the 'Rewardable: vault is empty' assert.
#
# Bash translation of `tests/e2e/src/harness.rs:282–384` —
# `sozo_build`, `force_play_artifacts_match`, parallel migrate,
# `seed_vault_shares`.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

require_env \
    SEPOLIA_RPC_URL \
    SEPOLIA_DEPLOYER_ADDRESS \
    SEPOLIA_DEPLOYER_PRIVATE_KEY \
    NUMS_WORLD_SEED

state_load
require_env \
    PILTOVER_ADDRESS \
    APPCHAIN_GENESIS_ADDRESS \
    APPCHAIN_GENESIS_PRIVKEY

REPO_ROOT="${REPO_ROOT:-/repo}"
TEMPLATES_DIR="${REPO_ROOT}/deploy/templates"
APPCHAIN_PROFILE_PATH="${REPO_ROOT}/dojo_appchain.toml"
SETTLEMENT_PROFILE_PATH="${REPO_ROOT}/dojo_settlement.toml"

# ----- 1. Idempotency probe -----------------------------------------------
if already_done worlds-migrated; then
    log "Stage C already complete — skipping"
    exit 0
fi

# ----- 2. Render Dojo profiles --------------------------------------------
#
# envsubst substitutes ${VAR} from the current shell env. We listed every
# placeholder in `-v` so unrelated ${...} sequences in comments aren't
# munged (envsubst's `-v` is empty by default, which is what we want for
# the Cairo init args — they're literal hex felts, no shell vars).

log "rendering Dojo profile templates → ${REPO_ROOT}"

# Vars used by the templates
export NUMS_WORLD_SEED \
       SEPOLIA_RPC_URL \
       SEPOLIA_DEPLOYER_ADDRESS \
       SEPOLIA_DEPLOYER_PRIVATE_KEY \
       PILTOVER_ADDRESS \
       APPCHAIN_GENESIS_ADDRESS \
       APPCHAIN_GENESIS_PRIVKEY

envsubst \
    '${NUMS_WORLD_SEED} ${SEPOLIA_RPC_URL} ${SEPOLIA_DEPLOYER_ADDRESS} ${SEPOLIA_DEPLOYER_PRIVATE_KEY} ${PILTOVER_ADDRESS}' \
    <"${TEMPLATES_DIR}/dojo_settlement.template.toml" \
    >"${SETTLEMENT_PROFILE_PATH}"
log "wrote ${SETTLEMENT_PROFILE_PATH}"

envsubst \
    '${NUMS_WORLD_SEED} ${APPCHAIN_GENESIS_ADDRESS} ${APPCHAIN_GENESIS_PRIVKEY} ${PILTOVER_ADDRESS}' \
    <"${TEMPLATES_DIR}/dojo_appchain.template.toml" \
    >"${APPCHAIN_PROFILE_PATH}"
log "wrote ${APPCHAIN_PROFILE_PATH}"

# ----- 3. sozo build (both profiles) --------------------------------------
#
# Build serially — Scarb's target/ races otherwise. Same gotcha noted in
# harness.rs:309–314.

cd "${REPO_ROOT}"

log "sozo build (settlement)…"
sozo build --profile settlement

log "sozo build (appchain)…"
sozo build --profile appchain

# ----- 4. force_play_artifacts_match -------------------------------------
#
# Copy the settlement profile's Play artifacts over the appchain
# profile's. This is the workaround for Dojo's non-deterministic Sierra
# output for the Play contract specifically (see harness.rs:283–322 for
# the full story). Both chains must declare the same Play class so the
# bridge's address-equality invariant holds. Drop this when upstream
# Dojo determinism lands.

SRC_DIR="${REPO_ROOT}/target/settlement"
DST_DIR="${REPO_ROOT}/target/appchain"
for fname in nums_Play.contract_class.json nums_Play.compiled_contract_class.json; do
    src="${SRC_DIR}/${fname}"
    dst="${DST_DIR}/${fname}"
    if [[ -f "${src}" ]]; then
        cp -f "${src}" "${dst}"
        log "force_play_artifacts_match: ${src} → ${dst}"
    else
        log "WARN: source artifact missing at ${src}, skipping (Play address-equality may break)"
    fi
done

# ----- 5. sozo migrate (parallel both profiles) ---------------------------
#
# Sepolia bursty txs can hit rate limits; if one migrate fails the other
# is allowed to finish (it landed gas-wise) before we re-raise. A
# failed migrate is safe to retry — Dojo's manifests are append-only.

log "sozo migrate (settlement + appchain in parallel)…"

settlement_log="${STATE_DIR}/migrate-settlement.log"
appchain_log="${STATE_DIR}/migrate-appchain.log"

sozo migrate --profile settlement >"${settlement_log}" 2>&1 &
settlement_pid=$!

sozo migrate --profile appchain >"${appchain_log}" 2>&1 &
appchain_pid=$!

settlement_rc=0; appchain_rc=0
wait "${settlement_pid}" || settlement_rc=$?
wait "${appchain_pid}"   || appchain_rc=$?

if (( settlement_rc != 0 )); then
    log "settlement migrate FAILED (rc=${settlement_rc}); tail:"
    tail -n 50 "${settlement_log}" >&2
fi
if (( appchain_rc != 0 )); then
    log "appchain migrate FAILED (rc=${appchain_rc}); tail:"
    tail -n 50 "${appchain_log}" >&2
fi
if (( settlement_rc != 0 || appchain_rc != 0 )); then
    die "sozo migrate failed — see logs above; rerun \`docker compose up\` to retry"
fi

log "both migrates green"

# ----- 6. Stash manifests for inspection ----------------------------------
#
# Dojo writes manifests under `manifest_<profile>/release/manifest.json`
# by default. Copy to /state so operators can inspect addresses without
# entering the migrate container.

mkdir -p "${STATE_DIR}/manifests"
for profile in settlement appchain; do
    src="${REPO_ROOT}/manifest_${profile}/release/manifest.json"
    dst="${STATE_DIR}/manifests/${profile}.json"
    if [[ -f "${src}" ]]; then
        cp -f "${src}" "${dst}"
        log "stashed manifest: ${dst}"
    fi
done

# ----- 7. Setup.set_bridge (idempotent safety net) ------------------------
#
# Both Dojo profiles already pass `${PILTOVER_ADDRESS}` as the
# `bridge_messaging` init arg, so the storage should be correctly
# wired by `dojo_init`. We still re-call `set_bridge` here as a
# guard against placeholder-init mistakes (the e2e harness does the
# same — see `tests/e2e/src/harness.rs::wire_cross_chain_addresses`).
# `sozo execute` resolves the Setup address via the profile's
# manifest, signs as the profile's account (admin on both chains),
# and pays fees in STRK by default.

log "Setup.set_bridge(${PILTOVER_ADDRESS}) on settlement Setup"
sozo execute --profile settlement NUMS-Setup set_bridge "${PILTOVER_ADDRESS}"

log "Setup.set_bridge(${PILTOVER_ADDRESS}) on appchain Setup"
sozo execute --profile appchain NUMS-Setup set_bridge "${PILTOVER_ADDRESS}"

# ----- 8. Seed settlement Vault ------------------------------------------
#
# `Rewardable::pay` asserts `total_shares != 0`. Deposit 1 NUMS (in
# 18-decimal units) so the first reward mint via `Play.claim` doesn't
# trip the assert. Same logic as `harness.rs::seed_vault_shares`.
#
# 1 NUMS = 1e18 = 0xde0b6b3a7640000. sozo's `u256:<hex>` calldata helper
# (`dojo/crates/dojo/world/src/config/calldata_decoder.rs:219`) expands
# this into the two felts (low, high) at invoke time. `/` separates
# multicall entries.
#
# We need the Vault address as the spender on the approve call —
# `world` resolves the Dojo World contract; for a Dojo system tag like
# `NUMS-Vault`, sozo resolves to its deployed address from the
# settlement profile's manifest. Use the `--diff` flag to force a
# manifest re-read if the chain state ever drifts from disk.

NUMS_ONE_U256="u256:0xde0b6b3a7640000"

log "seeding settlement Vault with 1 NUMS (approve + deposit from deployer)"
sozo execute --profile settlement --diff \
    NUMS-Token approve NUMS-Vault "${NUMS_ONE_U256}" \
    / \
    NUMS-Vault deposit "${NUMS_ONE_U256}" "${SEPOLIA_DEPLOYER_ADDRESS}"

log "Vault seeded"

mark_done worlds-migrated
log "Stage C complete"
