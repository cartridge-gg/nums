#!/usr/bin/env bash
# Shared helpers for the deploy/ stage scripts.
#
# Sourced (not executed): each stage entrypoint does
#   set -euo pipefail
#   source "$(dirname "$0")/lib.sh"
# at the top.

# Where stage scripts persist cross-stage state. Inside the docker
# containers this is a named volume (`state`) shared by every service;
# outside docker (e.g. running a script locally) it falls back to a
# repo-relative dir so a developer can poke at it.
: "${STATE_DIR:=/state}"

# Tag every log line with the script name so multi-stage logs are
# legible when compose interleaves them on one stream.
log() {
    local tag
    tag="$(basename "${BASH_SOURCE[1]:-${0}}")"
    printf '[%s] %s\n' "${tag}" "$*" >&2
}

# Fatal: log + exit 1. Use sparingly; reserve for genuine "no recovery"
# states (missing required env var, contract address parse failure).
die() {
    log "FATAL: $*"
    exit 1
}

# Require an env var to be non-empty. Pass var names, not values.
#   require_env SEPOLIA_DEPLOYER_ADDRESS SEPOLIA_DEPLOYER_PRIVATE_KEY
require_env() {
    local var
    for var in "$@"; do
        if [[ -z "${!var:-}" ]]; then
            die "missing required env var: ${var}"
        fi
    done
}

# Touch a flag file under /state. Used by every stage to signal
# "I already did this, don't repeat" on a re-`up`.
mark_done() {
    local flag="${STATE_DIR}/${1}.flag"
    mkdir -p "$(dirname "${flag}")"
    touch "${flag}"
    log "marked: ${flag}"
}

# True if a flag file exists. Use in early-return idempotency probes.
already_done() {
    [[ -f "${STATE_DIR}/${1}.flag" ]]
}

# Poll a JSON-RPC endpoint until it returns 200 + a JSON body containing
# `result`. Used to wait for Katana to be up before configure-piltover
# fires.
wait_for_rpc() {
    local url="$1"
    local timeout_secs="${2:-60}"
    local deadline=$(( $(date +%s) + timeout_secs ))
    log "waiting for RPC at ${url} (timeout ${timeout_secs}s)…"
    while (( $(date +%s) < deadline )); do
        if curl -fsS -X POST -H 'Content-Type: application/json' \
                -d '{"jsonrpc":"2.0","method":"starknet_chainId","params":[],"id":1}' \
                "${url}" 2>/dev/null | jq -e '.result' >/dev/null; then
            log "RPC is up at ${url}"
            return 0
        fi
        sleep 1
    done
    die "RPC ${url} did not respond within ${timeout_secs}s"
}

# Send a JSON-RPC call and return the `.result` JSON body, or fail loudly
# if `.error` is set. Args: <url> <method> <params-json>.
rpc_call() {
    local url="$1"
    local method="$2"
    local params="$3"
    local body
    body=$(curl -fsS -X POST -H 'Content-Type: application/json' \
        -d "$(jq -nc --arg m "${method}" --argjson p "${params}" \
              '{jsonrpc:"2.0", method:$m, params:$p, id:1}')" \
        "${url}")
    if jq -e '.error' <<<"${body}" >/dev/null 2>&1; then
        local err
        err=$(jq -c '.error' <<<"${body}")
        die "RPC ${method} returned error: ${err}"
    fi
    jq '.result' <<<"${body}"
}

# Pretty-print a felt that may come back from saya-ops' JSON output with
# leading zero padding. Strip + lowercase + re-prefix `0x`. Empty input
# is a fatal error (callers care).
normalize_felt() {
    local raw="$1"
    raw="${raw#0x}"
    raw="${raw#0X}"
    # strip leading zeros, then re-prefix
    raw="$(printf '%s' "${raw}" | sed 's/^0*//')"
    [[ -z "${raw}" ]] && raw=0
    printf '0x%s' "${raw}"
}

# Append a `KEY=value` pair to /state/state.env in a way safe to source
# from bash. Replaces any prior assignment of the same key.
state_set() {
    local key="$1" value="$2"
    local env_file="${STATE_DIR}/state.env"
    mkdir -p "${STATE_DIR}"
    if [[ -f "${env_file}" ]] && grep -q "^${key}=" "${env_file}"; then
        # Replace existing line (BSD sed compatible)
        sed -i.bak "s|^${key}=.*$|${key}=${value}|" "${env_file}"
        rm -f "${env_file}.bak"
    else
        printf '%s=%s\n' "${key}" "${value}" >>"${env_file}"
    fi
    log "state: ${key}=${value}"
}

# Source /state/state.env into the current shell. Tolerates a missing
# file (callers check downstream).
state_load() {
    local env_file="${STATE_DIR}/state.env"
    if [[ -f "${env_file}" ]]; then
        # shellcheck disable=SC1090
        set -a; source "${env_file}"; set +a
    fi
}
