#!/usr/bin/env bash
# Long-running Torii indexer for the appchain world.
#
# Reads the world address from manifest_appchain.json (produced by
# migrate.sh) and points torii at the local Katana on :6969.

set -euo pipefail

KATANA_URL="http://localhost:6969"
HTTP_PORT="8080"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DATA_DIR="${REPO_ROOT}/deploy/torii-data"
MANIFEST="${REPO_ROOT}/manifest_appchain.json"

log() { printf '[torii.sh] %s\n' "$*" >&2; }

[[ -f "${MANIFEST}" ]] \
    || { log "missing ${MANIFEST} — run migrate.sh first"; exit 1; }

world_address=$(jq -r '.world.address' "${MANIFEST}")
[[ -n "${world_address}" && "${world_address}" != "null" ]] \
    || { log "could not parse .world.address from ${MANIFEST}"; exit 1; }

mkdir -p "${DATA_DIR}"
log "indexing world ${world_address} (rpc=${KATANA_URL}, http :${HTTP_PORT})"

# --indexing.preconfirmed is the v1.8.x rename of --indexing.pending.
exec torii \
    --world "${world_address}" \
    --rpc "${KATANA_URL}" \
    --db-dir "${DATA_DIR}" \
    --http.addr 0.0.0.0 \
    --http.port "${HTTP_PORT}" \
    --http.cors_origins '*' \
    --indexing.preconfirmed \
    --indexing.polling_interval 250
