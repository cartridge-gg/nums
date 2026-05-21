#!/usr/bin/env bash
# Build + migrate both Dojo worlds, then wire the bridge and seed the
# settlement Vault with 1 NUMS.
#
# Requires:
#   - katana.sh running on http://localhost:6969
#   - SEPOLIA_DEPLOYER_PRIVATE_KEY in env (source deploy/.env)
#   - Pre-rendered dojo_settlement.toml + dojo_appchain.toml at repo root

set -euo pipefail

SEPOLIA_DEPLOYER_ADDRESS="0x02F6B748E2e823916c28CC1F4966fBE7856091B93d0cc1Ca1707dccDbbc801ab"
PILTOVER_ADDRESS="0x4f36831b9514aadc92786b6ac54549e8af232ca76f6248f2a38ca8aede6617"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="${REPO_ROOT}/.local-stack"

: "${SEPOLIA_DEPLOYER_PRIVATE_KEY:?set SEPOLIA_DEPLOYER_PRIVATE_KEY (source deploy/.env)}"

log() { printf '[migrate.sh] %s\n' "$*" >&2; }

cd "${REPO_ROOT}"
mkdir -p "${LOG_DIR}"

log "sozo build (settlement + appchain)"
sozo build --profile settlement
sozo build --profile appchain

# Sierra non-determinism workaround: force the appchain's Play artifacts
# to match the settlement's so both chains declare the same Play class
# (required for the bridge's address-equality invariant). Drop when
# upstream Dojo determinism lands. See tests/e2e/src/harness.rs:283–322.
log "force Play artifacts to match"
for fname in nums_Play.contract_class.json nums_Play.compiled_contract_class.json; do
    cp -f "target/settlement/${fname}" "target/appchain/${fname}"
done

log "sozo migrate (parallel)"
DOJO_PRIVATE_KEY="${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    sozo migrate --account-block-id latest --profile settlement \
    > "${LOG_DIR}/migrate-settlement.log" 2>&1 &
settlement_pid=$!
sozo migrate --profile appchain > "${LOG_DIR}/migrate-appchain.log" 2>&1 &
appchain_pid=$!

settlement_rc=0; appchain_rc=0
wait "${settlement_pid}" || settlement_rc=$?
wait "${appchain_pid}"   || appchain_rc=$?
if (( settlement_rc != 0 )); then
    log "settlement migrate FAILED (rc=${settlement_rc}); tail:"; tail -n 50 "${LOG_DIR}/migrate-settlement.log" >&2
fi
if (( appchain_rc != 0 )); then
    log "appchain migrate FAILED (rc=${appchain_rc}); tail:"; tail -n 50 "${LOG_DIR}/migrate-appchain.log" >&2
fi
(( settlement_rc == 0 && appchain_rc == 0 )) || exit 1

vault_address=$(jq -r '.contracts[] | select(.tag == "NUMS-Vault") | .address' \
    "${REPO_ROOT}/manifest_settlement.json")
[[ -n "${vault_address}" && "${vault_address}" != "null" ]] \
    || { log "could not find NUMS-Vault address in manifest_settlement.json"; exit 1; }

# 1 NUMS = 1e18 = 0xde0b6b3a7640000. sozo's `u256:<hex>` calldata helper
# expands this into the (low, high) felt pair at invoke time.
NUMS_ONE_U256="u256:0xde0b6b3a7640000"

# Bundle settlement-side state changes into one multicall so they share a
# single nonce — running as separate invocations races the Sepolia RPC's
# view of the deployer's nonce.
log "settlement: Setup.set_bridge + Token.approve + Vault.deposit (multicall)"
DOJO_PRIVATE_KEY="${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    sozo execute --profile settlement \
        NUMS-Setup set_bridge "${PILTOVER_ADDRESS}" \
        / \
        NUMS-Token approve "${vault_address}" "${NUMS_ONE_U256}" \
        / \
        NUMS-Vault deposit "${NUMS_ONE_U256}" "${SEPOLIA_DEPLOYER_ADDRESS}"

log "appchain: Setup.set_bridge"
sozo execute --profile appchain NUMS-Setup set_bridge "${PILTOVER_ADDRESS}"

log "done"
