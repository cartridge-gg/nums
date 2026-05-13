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
# `bridge_messaging` init arg, so the storage should be correctly wired
# by `dojo_init`. We still call `set_bridge` here as a no-op
# guard against the rare case where someone seeded a placeholder by
# mistake. The settlement Setup re-calls `set_bridge` on settlement;
# the appchain Setup re-calls on appchain. Both are admin-gated to the
# deployer / genesis account respectively, which is what we already
# signed migrate with.

set_bridge_settlement() {
    local setup_addr
    setup_addr=$(jq -r '.contracts[] | select(.tag == "NUMS-Setup") | .address' \
        "${STATE_DIR}/manifests/settlement.json")
    [[ -n "${setup_addr}" && "${setup_addr}" != "null" ]] \
        || die "could not find NUMS-Setup address in settlement manifest"
    setup_addr="$(normalize_felt "${setup_addr}")"
    log "Setup.set_bridge(${PILTOVER_ADDRESS}) on settlement Setup ${setup_addr}"
    starkli invoke \
        --rpc "${SEPOLIA_RPC_URL}" \
        --account /dev/null \
        --strk \
        --private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
        "${setup_addr}" set_bridge "${PILTOVER_ADDRESS}"
}

set_bridge_appchain() {
    local setup_addr
    setup_addr=$(jq -r '.contracts[] | select(.tag == "NUMS-Setup") | .address' \
        "${STATE_DIR}/manifests/appchain.json")
    [[ -n "${setup_addr}" && "${setup_addr}" != "null" ]] \
        || die "could not find NUMS-Setup address in appchain manifest"
    setup_addr="$(normalize_felt "${setup_addr}")"
    log "Setup.set_bridge(${PILTOVER_ADDRESS}) on appchain Setup ${setup_addr}"
    starkli invoke \
        --rpc "${KATANA_URL:-http://katana:5050}" \
        --account /dev/null \
        --strk \
        --private-key "${APPCHAIN_GENESIS_PRIVKEY}" \
        "${setup_addr}" set_bridge "${PILTOVER_ADDRESS}"
}

set_bridge_settlement
set_bridge_appchain

# ----- 8. Seed settlement Vault ------------------------------------------
#
# `Rewardable::pay` asserts `total_shares != 0`. Deposit 1 NUMS (in 18-
# decimal units) so the first reward mint via `Play.claim` doesn't
# trip the assert. Same logic as `harness.rs::seed_vault_shares`.

VAULT_ADDR=$(jq -r '.contracts[] | select(.tag == "NUMS-Vault") | .address' \
    "${STATE_DIR}/manifests/settlement.json")
TOKEN_ADDR=$(jq -r '.contracts[] | select(.tag == "NUMS-Token") | .address' \
    "${STATE_DIR}/manifests/settlement.json")
[[ -n "${VAULT_ADDR}" && "${VAULT_ADDR}" != "null" ]] \
    || die "missing NUMS-Vault in settlement manifest"
[[ -n "${TOKEN_ADDR}" && "${TOKEN_ADDR}" != "null" ]] \
    || die "missing NUMS-Token in settlement manifest"
VAULT_ADDR="$(normalize_felt "${VAULT_ADDR}")"
TOKEN_ADDR="$(normalize_felt "${TOKEN_ADDR}")"

log "seeding Vault ${VAULT_ADDR} with 1 NUMS (approve+deposit from deployer)"
# u256 = (low, high). 1 NUMS = 1e18 = 0xDE0B6B3A7640000 (low), 0x0 (high).
NUMS_ONE_LOW="0xde0b6b3a7640000"
NUMS_ONE_HIGH="0x0"

starkli invoke \
    --rpc "${SEPOLIA_RPC_URL}" \
    --account /dev/null \
    --strk \
    --private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    "${TOKEN_ADDR}" approve "${VAULT_ADDR}" "${NUMS_ONE_LOW}" "${NUMS_ONE_HIGH}" \
    "${VAULT_ADDR}" deposit "${NUMS_ONE_LOW}" "${NUMS_ONE_HIGH}" "${SEPOLIA_DEPLOYER_ADDRESS}"

log "Vault seeded"

mark_done worlds-migrated
log "Stage C complete"
