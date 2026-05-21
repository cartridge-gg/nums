#!/usr/bin/env bash
# Long-running appchain Katana. On a fresh checkout (no deploy/chain-config/),
# bootstraps the settlement side first: deploys the TEE registry mock on
# Sepolia (salt-deterministic) and runs `katana init rollup --tee …` to
# declare/deploy the Piltover core and wire its ProgramInfo to KatanaTee.
#
# After the bootstrap path runs, commit the updated deploy/chain-config/
# and re-render the dojo profile tomls — the freshly generated genesis
# keypair won't match the committed values otherwise.

set -euo pipefail

SEPOLIA_RPC_URL="https://api.cartridge.gg/x/starknet/sepolia"
SEPOLIA_DEPLOYER_ADDRESS="0x02F6B748E2e823916c28CC1F4966fBE7856091B93d0cc1Ca1707dccDbbc801ab"
APPCHAIN_CHAIN_ID="NUMS_APPCHAIN_SEPOLIA"
TEE_REGISTRY_SALT="0x6e756d7364"
KATANA_HTTP_PORT="6969"

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "${DEPLOY_DIR}/.." && pwd)"
CHAIN_CONFIG_DIR="${DEPLOY_DIR}/chain-config"
DATA_DIR="${REPO_ROOT}/.local-stack/katana-data"

log() { printf '[katana.sh] %s\n' "$*" >&2; }

if [[ ! -f "${CHAIN_CONFIG_DIR}/config.toml" ]]; then
    : "${SEPOLIA_DEPLOYER_PRIVATE_KEY:?set SEPOLIA_DEPLOYER_PRIVATE_KEY (source deploy/.env)}"

    log "no chain-config — deploying TEE registry mock + Piltover on Sepolia"
    deploy_output=$(saya-ops core-contract \
        --account-address "${SEPOLIA_DEPLOYER_ADDRESS}" \
        --private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
        --settlement-rpc-url "${SEPOLIA_RPC_URL}" \
        --settlement-chain-id sepolia \
        --output json \
        declare-and-deploy-tee-registry-mock \
        --salt "${TEE_REGISTRY_SALT}")

    tee_registry_address=""
    while IFS= read -r line; do
        [[ "${line}" =~ ^\{ ]] || continue
        addr=$(jq -r '.contract_address // empty' <<<"${line}" 2>/dev/null || true)
        [[ -n "${addr}" ]] && { tee_registry_address="${addr}"; break; }
    done <<<"${deploy_output}"
    [[ -n "${tee_registry_address}" ]] || { log "TEE registry deploy: no contract_address in saya-ops output"; exit 1; }
    log "TEE registry mock at ${tee_registry_address}"

    mkdir -p "${CHAIN_CONFIG_DIR}"
    katana init rollup \
        --id "${APPCHAIN_CHAIN_ID}" \
        --settlement-chain "${SEPOLIA_RPC_URL}" \
        --settlement-account-address "${SEPOLIA_DEPLOYER_ADDRESS}" \
        --settlement-account-private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
        --tee \
        --tee-registry-address "${tee_registry_address}" \
        --output-path "${CHAIN_CONFIG_DIR}"

    log "chain-config written — commit deploy/chain-config/ + re-render dojo_*.toml from the new genesis"
fi

mkdir -p "${DATA_DIR}"
log "serving katana (--chain ${CHAIN_CONFIG_DIR}, port ${KATANA_HTTP_PORT})"

# --invoke-max-steps + --validate-max-steps match the e2e harness (harness.rs:128–131)
# so big Dojo declares don't bump the cap.
exec katana \
    --chain "${CHAIN_CONFIG_DIR}" \
    --http.addr 0.0.0.0 \
    --http.port "${KATANA_HTTP_PORT}" \
    --http.cors-origins "*" \
    --explorer \
    --tee mock \
    --dev --dev.no-fee \
    --data-dir "${DATA_DIR}" \
    --invoke-max-steps 100000000 \
    --validate-max-steps 10000000
