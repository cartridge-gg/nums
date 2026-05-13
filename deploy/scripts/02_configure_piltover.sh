#!/usr/bin/env bash
# Stage B.2 — configure-piltover
#
# Probes the appchain Katana (running in the `katana` compose service)
# for its `katana_tee_config_hash`, then writes the matching
# `ProgramInfo::KatanaTee` variant onto the Piltover core on the
# settlement chain. Without this, Saya's `update_state` reverts with
# `'mode: tee needs KatanaTee cfg'`.
#
# This script is the bash translation of
# `tests/e2e/src/harness.rs:366–459` — same RPC probe, same calldata.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

require_env \
    SEPOLIA_RPC_URL \
    SEPOLIA_DEPLOYER_ADDRESS \
    SEPOLIA_DEPLOYER_PRIVATE_KEY

state_load
require_env PILTOVER_ADDRESS TEE_REGISTRY_ADDRESS

KATANA_URL="${KATANA_URL:-http://katana:5050}"

# ----- 1. Idempotency probe -----------------------------------------------
if already_done piltover-configured; then
    log "Stage B.2 already complete — skipping"
    exit 0
fi

# ----- 2. Probe Katana's tee_generateQuote endpoint -----------------------
#
# Confirms `--tee mock` is wired on the appchain Katana AND captures the
# `katana_tee_config_hash` we'll bind into Piltover's ProgramInfo.
# Same pattern as harness.rs:366–406.

wait_for_rpc "${KATANA_URL}" 120

log "probing ${KATANA_URL} for tee_generateQuote…"
quote=$(rpc_call "${KATANA_URL}" tee_generateQuote '[null, 0]')
config_hash=$(jq -r '.katanaTeeConfigHash // empty' <<<"${quote}")
[[ -n "${config_hash}" ]] \
    || die "tee_generateQuote response missing katanaTeeConfigHash — is Katana running with \`--tee mock\`?"
config_hash="$(normalize_felt "${config_hash}")"
log "captured katana_tee_config_hash=${config_hash}"

# ----- 3. Send Piltover set_program_info(KatanaTee { hash }) --------------
#
# saya-ops' `setup-program` hard-codes the StarknetOs variant; for TEE
# settlement we need variant 1 (KatanaTee) with the appchain's config
# hash as its inner felt. Use starkli to send the raw multicall.
#
# Cairo Serde encoding of the ProgramInfo enum:
#   StarknetOs: [0, bootloader_hash, snos_config_hash, snos_program_hash, layout_bridge_program_hash]
#   KatanaTee:  [1, katana_tee_config_hash]
# We want variant 1, so calldata = [0x1, <config_hash>].

log "calling set_program_info(KatanaTee { ${config_hash} }) on Piltover ${PILTOVER_ADDRESS}"

# starkli requires either a keystore or STARKNET_PRIVATE_KEY env. We
# expose the deployer's private key via env (already required at script
# entry) so starkli picks it up automatically.
export STARKNET_RPC="${SEPOLIA_RPC_URL}"
export STARKNET_ACCOUNT_ADDRESS="${SEPOLIA_DEPLOYER_ADDRESS}"
export STARKNET_PRIVATE_KEY="${SEPOLIA_DEPLOYER_PRIVATE_KEY}"

# `starkli invoke` with raw calldata. `set_program_info` takes a
# single `ProgramInfo` enum; starkli accepts trailing positional felts
# as the call's calldata in declaration order, so passing `0x1` followed
# by the config hash is enough.
starkli invoke \
    --rpc "${SEPOLIA_RPC_URL}" \
    --account /dev/null \
    --strk \
    --private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    "${PILTOVER_ADDRESS}" set_program_info 0x1 "${config_hash}"

log "Piltover set_program_info OK"

# ----- 4. (Conditional) set_facts_registry --------------------------------
#
# `katana init rollup` already passed `--settlement-facts-registry
# ${TEE_REGISTRY_ADDRESS}` in Stage A, so the on-chain facts_registry
# slot should already point at the TEE registry mock. We still call
# `set_facts_registry` here as a no-op safety net — if Stage A's init
# path skipped the write for any reason (e.g. older Katana), this fills
# the gap. The Piltover component re-emits the changed event each time;
# downstream reads aren't sensitive.

log "calling set_facts_registry(${TEE_REGISTRY_ADDRESS}) on Piltover (idempotent safety net)"
starkli invoke \
    --rpc "${SEPOLIA_RPC_URL}" \
    --account /dev/null \
    --strk \
    --private-key "${SEPOLIA_DEPLOYER_PRIVATE_KEY}" \
    "${PILTOVER_ADDRESS}" set_facts_registry "${TEE_REGISTRY_ADDRESS}"

log "Piltover set_facts_registry OK"

# ----- 5. Persist + flag --------------------------------------------------

state_set KATANA_TEE_CONFIG_HASH "${config_hash}"
mark_done piltover-configured
log "Stage B.2 complete"
