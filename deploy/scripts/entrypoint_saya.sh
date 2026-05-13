#!/usr/bin/env bash
# Stage D — long-running saya-tee process.
#
# Loads /state/state.env (populated by Stages A + B.2), then execs
# saya-tee. `exec` so SIGTERM reaches saya directly.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

require_env \
    SEPOLIA_RPC_URL \
    SEPOLIA_DEPLOYER_ADDRESS \
    SEPOLIA_DEPLOYER_PRIVATE_KEY \
    SEPOLIA_PROVER_PRIVATE_KEY

state_load
require_env PILTOVER_ADDRESS TEE_REGISTRY_ADDRESS

KATANA_URL="${KATANA_URL:-http://katana:5050}"
DB_DIR="${SAYA_DB_DIR:-/data/saya}"

# Wait for Katana to be reachable. compose's `depends_on:
# condition: service_completed_successfully` for `migrate` already
# implies Katana is healthy, but Stage C is one-shot so we sanity-check
# here in case of races on restart.
wait_for_rpc "${KATANA_URL}" 120

mkdir -p "${DB_DIR}"

log "starting saya-tee (rollup=${KATANA_URL}, settlement=${SEPOLIA_RPC_URL})"
log "  Piltover=${PILTOVER_ADDRESS}"
log "  TEE registry=${TEE_REGISTRY_ADDRESS}"

# --batch-size 1 + 1-second poll: dev-leaning defaults. Production should
# raise batch-size to amortize Sepolia gas. --idle-timeout-secs flushes
# a partial batch after N seconds idle on the appchain.
exec saya-tee tee start \
    --mock-prove \
    --rollup-rpc "${KATANA_URL}" \
    --settlement-rpc "${SEPOLIA_RPC_URL}" \
    --settlement-piltover-address "${PILTOVER_ADDRESS}" \
    --settlement-account-address "${SEPOLIA_DEPLOYER_ADDRESS}" \
    --settlement-account-private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    --tee-registry-address "${TEE_REGISTRY_ADDRESS}" \
    --prover-private-key "${SEPOLIA_PROVER_PRIVATE_KEY}" \
    --db-dir "${DB_DIR}" \
    --batch-size 1 \
    --attestor-poll-interval-ms 1000 \
    --idle-timeout-secs 30
