#!/usr/bin/env bash
# Stage B.1 — long-running appchain Katana.
#
# Wait for Stage A to populate /state/chain-config, then exec katana.
# `exec` so signals (SIGTERM on `docker compose down`) reach katana
# directly rather than this shell wrapper.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

CHAIN_CONFIG_DIR="${STATE_DIR}/chain-config"
DATA_DIR="${KATANA_DATA_DIR:-/data/katana}"

# Stage A populates this; compose's `depends_on: service_completed_successfully`
# already guarantees the bootstrap container exited, but we still poll
# briefly in case the named volume is slow to surface the file (some
# overlay drivers buffer writes for a heartbeat).
deadline=$(( $(date +%s) + 30 ))
while [[ ! -f "${CHAIN_CONFIG_DIR}/config.toml" ]]; do
    if (( $(date +%s) >= deadline )); then
        die "chain-config never appeared at ${CHAIN_CONFIG_DIR} — did Stage A run?"
    fi
    sleep 1
done

log "starting katana (--chain ${CHAIN_CONFIG_DIR}, --tee mock, --data-dir ${DATA_DIR})"
mkdir -p "${DATA_DIR}"

# --invoke-max-steps + --validate-max-steps match what the e2e harness
# passes (harness.rs:128–131) so big Dojo declares don't bump the cap.
# --http.addr 0.0.0.0 is required so other compose services (and the
# host's port mapping) can reach Katana through docker DNS.
exec katana \
    --chain "${CHAIN_CONFIG_DIR}" \
    --http.addr 0.0.0.0 \
    --http.port 5050 \
    --tee mock \
    --data-dir "${DATA_DIR}" \
    --invoke-max-steps 100000000 \
    --validate-max-steps 10000000
