#!/usr/bin/env bash
# Build + migrate the Dojo worlds, then wire the bridge and seed the
# sepolia Vault with 1 NUMS.
#
# Usage:
#   migrate.sh                      # both profiles (default)
#   migrate.sh --only sepolia    # sepolia only (skip appchain)
#   migrate.sh --only appchain      # appchain only (skip sepolia)
#
# Requires:
#   - katana.sh running on http://localhost:6969 (for appchain)
#   - SEPOLIA_DEPLOYER_PRIVATE_KEY in env (source deploy/.env)
#   - Pre-rendered dojo_sepolia.toml + dojo_appchain.toml at repo root

set -euo pipefail

SEPOLIA_DEPLOYER_ADDRESS="0x02F6B748E2e823916c28CC1F4966fBE7856091B93d0cc1Ca1707dccDbbc801ab"
PILTOVER_ADDRESS="0x2c784f47b6620b46e9b56e1f9616269f7c56ff54e321483fd011fbd9e3f3a0a"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="${REPO_ROOT}/.local-stack"

log() { printf '[migrate.sh] %s\n' "$*" >&2; }
die() { log "$*"; exit 1; }

only=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --only)    only="${2:-}"; shift 2 ;;
        --only=*)  only="${1#*=}"; shift ;;
        -h|--help) sed -n '2,12p' "$0" >&2; exit 0 ;;
        *)         die "unknown arg: $1 (try --help)" ;;
    esac
done
case "${only}" in
    ""|sepolia|appchain) ;;
    *) die "--only must be 'sepolia' or 'appchain', got '${only}'" ;;
esac

run_sepolia=true
run_appchain=true
[[ "${only}" == "appchain"   ]] && run_sepolia=false
[[ "${only}" == "sepolia" ]] && run_appchain=false

: "${SEPOLIA_DEPLOYER_PRIVATE_KEY:?set SEPOLIA_DEPLOYER_PRIVATE_KEY (source deploy/.env)}"

cd "${REPO_ROOT}"
mkdir -p "${LOG_DIR}"

# Build BOTH profiles + run the Play-artifact copy unconditionally, even
# under --only. Sierra non-determinism means independent builds of Play
# across time produce different class hashes (verified: back-to-back
# `sozo build --profile X` runs of the same source give different
# nums_Play.contract_class.json hashes). Keeping the class hashes in
# sync across chains means Play has identical behavior on both sides;
# the bridge wires the cross-chain ROUTING via set_bridge's `peer` arg
# below, so contract addresses themselves no longer need to match.
log "sozo build (sepolia + appchain) + force Play artifacts to match"
sozo build --profile sepolia
sozo build --profile appchain
for fname in nums_Play.contract_class.json nums_Play.compiled_contract_class.json; do
    cp -f "target/sepolia/${fname}" "target/appchain/${fname}"
done

if ${run_sepolia} && ${run_appchain}; then
    log "sozo migrate (parallel)"
    DOJO_PRIVATE_KEY="${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
        sozo migrate --account-block-id latest --profile sepolia \
        > "${LOG_DIR}/migrate-sepolia.log" 2>&1 &
    sepolia_pid=$!
    sozo migrate --profile appchain > "${LOG_DIR}/migrate-appchain.log" 2>&1 &
    appchain_pid=$!

    sepolia_rc=0; appchain_rc=0
    wait "${sepolia_pid}" || sepolia_rc=$?
    wait "${appchain_pid}"   || appchain_rc=$?
    if (( sepolia_rc != 0 )); then
        log "sepolia migrate FAILED (rc=${sepolia_rc}); tail:"; tail -n 50 "${LOG_DIR}/migrate-sepolia.log" >&2
    fi
    if (( appchain_rc != 0 )); then
        log "appchain migrate FAILED (rc=${appchain_rc}); tail:"; tail -n 50 "${LOG_DIR}/migrate-appchain.log" >&2
    fi
    (( sepolia_rc == 0 && appchain_rc == 0 )) || exit 1
elif ${run_sepolia}; then
    log "sozo migrate (sepolia)"
    DOJO_PRIVATE_KEY="${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
        sozo migrate --account-block-id latest --profile sepolia \
        2>&1 | tee "${LOG_DIR}/migrate-sepolia.log"
elif ${run_appchain}; then
    log "sozo migrate (appchain)"
    sozo migrate --profile appchain 2>&1 | tee "${LOG_DIR}/migrate-appchain.log"
fi

# Resolve the cross-chain `Play` peer address for each set_bridge call.
# `set_bridge(bridge_messaging, peer)`: `peer` is the Play contract on the
# OTHER chain. Pass 0x0 if we can't read the other side's manifest — per
# the contract docs that leaves the previous peer in place / initializes
# the chain without a peer (cross-chain calls then revert with
# 'Bridge: peer not set' until a follow-up set_bridge wires the real peer).
read_play_address() {
    local manifest="$1"
    [[ -f "${manifest}" ]] || { printf '0x0'; return; }
    local addr
    addr=$(jq -r '.contracts[] | select(.tag == "NUMS-Play") | .address // empty' "${manifest}")
    [[ -n "${addr}" ]] && printf '%s' "${addr}" || printf '0x0'
}
sepolia_play=$(read_play_address "${REPO_ROOT}/manifest_sepolia.json")
appchain_play=$(read_play_address "${REPO_ROOT}/manifest_appchain.json")

if ${run_sepolia}; then
    vault_address=$(jq -r '.contracts[] | select(.tag == "NUMS-Vault") | .address' \
        "${REPO_ROOT}/manifest_sepolia.json")
    [[ -n "${vault_address}" && "${vault_address}" != "null" ]] \
        || die "could not find NUMS-Vault address in manifest_sepolia.json"

    # 1 NUMS = 1e18 = 0xde0b6b3a7640000. sozo's `u256:<hex>` calldata
    # helper expands this into the (low, high) felt pair at invoke time.
    NUMS_ONE_U256="u256:0xde0b6b3a7640000"

    [[ "${appchain_play}" == "0x0" ]] \
        && log "WARN: manifest_appchain.json missing — sepolia set_bridge will not wire the appchain peer"

    # Bundle sepolia-side state changes into one multicall so they share
    # a single nonce — running as separate invocations races the Sepolia
    # RPC's view of the deployer's nonce.
    log "sepolia: Setup.set_bridge + Token.approve + Vault.deposit (multicall)"
    DOJO_PRIVATE_KEY="${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
        sozo execute --profile sepolia \
            NUMS-Setup set_bridge "${PILTOVER_ADDRESS}" "${appchain_play}" \
            / \
            NUMS-Token approve "${vault_address}" "${NUMS_ONE_U256}" \
            / \
            NUMS-Vault deposit "${NUMS_ONE_U256}" "${SEPOLIA_DEPLOYER_ADDRESS}"
fi

if ${run_appchain}; then
    [[ "${sepolia_play}" == "0x0" ]] \
        && log "WARN: manifest_sepolia.json missing — appchain set_bridge will not wire the sepolia peer"

    log "appchain: Setup.set_bridge"
    sozo execute --profile appchain NUMS-Setup set_bridge "${PILTOVER_ADDRESS}" "${sepolia_play}"
fi

log "done"
