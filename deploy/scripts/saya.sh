#!/usr/bin/env bash
# Long-running saya-tee in mock-prove mode. Proves every appchain block
# and submits the state root to the Piltover core on Sepolia.

set -euo pipefail

SEPOLIA_RPC_URL="https://api.cartridge.gg/x/starknet/sepolia"
SEPOLIA_DEPLOYER_ADDRESS="0x02F6B748E2e823916c28CC1F4966fBE7856091B93d0cc1Ca1707dccDbbc801ab"
PILTOVER_ADDRESS="0x4f36831b9514aadc92786b6ac54549e8af232ca76f6248f2a38ca8aede6617"
TEE_REGISTRY_ADDRESS="0x2528fd2aef183977ac8e905e179d127efe3ac14feb3a39e2e2d1cdc87b9a385"
KATANA_URL="http://localhost:6969"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DATA_DIR="${REPO_ROOT}/.local-stack/saya-data"

: "${SEPOLIA_DEPLOYER_PRIVATE_KEY:?set SEPOLIA_DEPLOYER_PRIVATE_KEY (source deploy/.env)}"
: "${SEPOLIA_PROVER_PRIVATE_KEY:?set SEPOLIA_PROVER_PRIVATE_KEY (source deploy/.env)}"

log() { printf '[saya.sh] %s\n' "$*" >&2; }

mkdir -p "${DATA_DIR}"
log "starting saya-tee (rollup=${KATANA_URL}, settlement=${SEPOLIA_RPC_URL})"

# --batch-size 1 + 1s poll: dev-leaning defaults. Production should raise
# batch-size to amortize Sepolia gas. --idle-timeout-secs flushes a
# partial batch after N seconds idle on the appchain.
exec saya-tee tee start \
    --mock-prove \
    --rollup-rpc "${KATANA_URL}" \
    --settlement-rpc "${SEPOLIA_RPC_URL}" \
    --settlement-piltover-address "${PILTOVER_ADDRESS}" \
    --settlement-account-address "${SEPOLIA_DEPLOYER_ADDRESS}" \
    --settlement-account-private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    --tee-registry-address "${TEE_REGISTRY_ADDRESS}" \
    --prover-private-key "${SEPOLIA_PROVER_PRIVATE_KEY}" \
    --db-dir "${DATA_DIR}" \
    --batch-size 1 \
    --attestor-poll-interval-ms 1000 \
    --idle-timeout-secs 30
