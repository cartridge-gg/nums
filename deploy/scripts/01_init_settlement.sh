#!/usr/bin/env bash
# Stage A — bootstrap-settlement
#
# Translates `tests/e2e/src/harness.rs::TestEnv::start` steps 1–4 to
# bash, retargeted at Starknet Sepolia (or whatever `SEPOLIA_RPC_URL`
# resolves to). Produces a chain config dir + state.env consumed by
# every later stage.
#
# Idempotent: if the chain-config dir AND state.env both exist on a
# prior `docker compose up`, this script logs "already complete" and
# returns 0 without making any on-chain calls.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

require_env \
    SEPOLIA_RPC_URL \
    SEPOLIA_DEPLOYER_ADDRESS \
    SEPOLIA_DEPLOYER_PRIVATE_KEY \
    APPCHAIN_CHAIN_ID \
    TEE_REGISTRY_SALT

CHAIN_CONFIG_DIR="${STATE_DIR}/chain-config"
CONFIG_TOML="${CHAIN_CONFIG_DIR}/config.toml"
GENESIS_JSON="${CHAIN_CONFIG_DIR}/genesis.json"
STATE_ENV="${STATE_DIR}/state.env"

# ----- 1. Idempotency probe -----------------------------------------------
if [[ -f "${CONFIG_TOML}" && -f "${GENESIS_JSON}" && -f "${STATE_ENV}" ]] \
   && already_done settlement-bootstrap; then
    log "Stage A already complete — chain-config + state.env present, skipping"
    exit 0
fi

# Detect a partial / corrupted state and bail loudly. If you hit this,
# `docker compose down -v` will wipe the volume so you can re-bootstrap.
if [[ -e "${CHAIN_CONFIG_DIR}" && ! -f "${CONFIG_TOML}" ]]; then
    die "chain-config dir exists but config.toml is missing (state is partial) — \`docker compose down -v\` to reset"
fi

# ----- 2. Deploy TEE registry mock on Sepolia -----------------------------
#
# Same call as `tests/e2e/src/saya_ops.rs::declare_and_deploy_tee_registry_mock`,
# but we shell out directly here. `saya-ops` emits structured JSON to
# stdout with `--output json`; we capture `.contract_address` via jq.
# Note: saya-ops auto-resolves `--settlement-rpc-url` for the `sepolia`
# chain-id alias, but we pass it explicitly so an operator can point at a
# private RPC instead of the public Cartridge endpoint.

log "deploying TEE registry mock on Sepolia (salt=${TEE_REGISTRY_SALT})…"
mkdir -p "${STATE_DIR}"

set +e
deploy_output=$(saya-ops core-contract \
    --account-address "${SEPOLIA_DEPLOYER_ADDRESS}" \
    --private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    --settlement-rpc-url "${SEPOLIA_RPC_URL}" \
    --settlement-chain-id sepolia \
    --output json \
    declare-and-deploy-tee-registry-mock \
    --salt "${TEE_REGISTRY_SALT}" 2>&1)
deploy_rc=$?
set -e

if (( deploy_rc != 0 )); then
    log "saya-ops failed (rc=${deploy_rc}):"
    log "${deploy_output}"
    die "TEE registry mock deploy failed — check Sepolia gas + RPC reachability"
fi

# saya-ops can emit multiple JSON objects (one per phase); scan for the
# first one carrying contract_address. Mirrors saya_ops.rs::parse_deployed_address.
tee_registry_address=""
while IFS= read -r line; do
    [[ "${line}" =~ ^\{ ]] || continue
    addr=$(jq -r '.contract_address // empty' <<<"${line}" 2>/dev/null || true)
    if [[ -n "${addr}" ]]; then
        tee_registry_address="${addr}"
        break
    fi
done <<<"${deploy_output}"

[[ -n "${tee_registry_address}" ]] \
    || die "TEE registry mock deployed, but contract_address not found in saya-ops output"

tee_registry_address="$(normalize_felt "${tee_registry_address}")"
log "TEE registry mock deployed at ${tee_registry_address}"

# ----- 3. katana init rollup ----------------------------------------------
#
# Initializes a fresh rollup chain spec on disk + declares & deploys the
# Piltover Appchain core on Sepolia. The `--tee --tee-registry-address`
# pair wires the facts_registry slot to our mock at init time so we
# don't need a separate `set_facts_registry` call later.
#
# Mirrors `tests/e2e/src/rollup.rs::init_rollup`.

log "running katana init rollup (chain_id=${APPCHAIN_CHAIN_ID})…"
mkdir -p "${CHAIN_CONFIG_DIR}"

# `katana init rollup` prompts interactively when args are missing — pass
# everything via flags so the container never tries to read stdin.
katana init rollup \
    --id "${APPCHAIN_CHAIN_ID}" \
    --settlement-chain "${SEPOLIA_RPC_URL}" \
    --settlement-account-address "${SEPOLIA_DEPLOYER_ADDRESS}" \
    --settlement-account-private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    --settlement-facts-registry "${tee_registry_address}" \
    --output-path "${CHAIN_CONFIG_DIR}" \
    --output text

[[ -f "${CONFIG_TOML}" ]] \
    || die "katana init rollup did not produce ${CONFIG_TOML}"
[[ -f "${GENESIS_JSON}" ]] \
    || die "katana init rollup did not produce ${GENESIS_JSON}"

# ----- 4. Extract Piltover core address + genesis account -----------------
#
# `core_contract` lives under [settlement.starknet] in config.toml; the
# single genesis account lives in genesis.json's accounts map. We
# canonicalize all the felts before writing state.env so downstream
# scripts can do plain string comparison.

piltover_address=$(grep -E '^\s*core_contract\s*=' "${CONFIG_TOML}" \
    | sed -E 's/.*=\s*"([^"]+)".*/\1/' \
    | head -n 1)
[[ -n "${piltover_address}" ]] \
    || die "could not parse core_contract from ${CONFIG_TOML}"
piltover_address="$(normalize_felt "${piltover_address}")"

deployed_block=$(grep -E '^\s*block\s*=' "${CONFIG_TOML}" \
    | sed -E 's/.*=\s*([0-9]+).*/\1/' \
    | head -n 1)
[[ -n "${deployed_block}" ]] \
    || die "could not parse deployed_block from ${CONFIG_TOML}"

# Pull the single auto-generated genesis account out of genesis.json.
# init_rollup always creates exactly one, so we take the first entry.
genesis_address=$(jq -r '.accounts | keys[0]' "${GENESIS_JSON}")
[[ "${genesis_address}" != "null" && -n "${genesis_address}" ]] \
    || die "no accounts in ${GENESIS_JSON}"
genesis_pubkey=$(jq -r --arg a "${genesis_address}" '.accounts[$a].publicKey' "${GENESIS_JSON}")
genesis_privkey=$(jq -r --arg a "${genesis_address}" '.accounts[$a].privateKey' "${GENESIS_JSON}")
genesis_salt=$(jq -r --arg a "${genesis_address}" '.accounts[$a].salt // "0x29a"' "${GENESIS_JSON}")
genesis_class=$(jq -r --arg a "${genesis_address}" '.accounts[$a].class' "${GENESIS_JSON}")

genesis_address="$(normalize_felt "${genesis_address}")"
genesis_pubkey="$(normalize_felt "${genesis_pubkey}")"
genesis_privkey="$(normalize_felt "${genesis_privkey}")"
genesis_salt="$(normalize_felt "${genesis_salt}")"

log "Piltover core deployed at ${piltover_address} (block ${deployed_block})"
log "appchain genesis account: ${genesis_address}"

# ----- 5. Persist for downstream stages -----------------------------------

state_set TEE_REGISTRY_ADDRESS    "${tee_registry_address}"
state_set PILTOVER_ADDRESS        "${piltover_address}"
state_set PILTOVER_DEPLOYED_BLOCK "${deployed_block}"
state_set APPCHAIN_GENESIS_ADDRESS "${genesis_address}"
state_set APPCHAIN_GENESIS_PUBKEY  "${genesis_pubkey}"
state_set APPCHAIN_GENESIS_PRIVKEY "${genesis_privkey}"
state_set APPCHAIN_GENESIS_SALT    "${genesis_salt}"
state_set APPCHAIN_GENESIS_CLASS   "${genesis_class}"

mark_done settlement-bootstrap
log "Stage A complete"
