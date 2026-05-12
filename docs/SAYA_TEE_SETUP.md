# Saya-TEE setup for the Nums e2e harness

The Nums e2e harness drives a real `saya-tee` child process to exercise
the appchain → mainnet reverse direction of the cross-chain bridge.
This doc captures the prerequisites, the moving parts, and the
mock-prove / mock-registry rationale.

## Binaries

The harness expects two binaries from
[`dojoengine/saya`](https://github.com/dojoengine/saya):

| Binary | Source | Default path |
|---|---|---|
| `saya-tee` | `bin/persistent-tee/` | `~/Projects/dojoengine/saya/bin/persistent-tee/target/release/saya-tee` |
| `saya-ops` | `bin/ops/` | `~/Projects/dojoengine/saya/bin/ops/target/release/saya-ops` |

Each `bin/` subdir is its OWN workspace (separate `Cargo.toml`), so
build each from its own directory:

```sh
cd ~/Projects/dojoengine/saya/bin/persistent-tee && cargo build --release --bin saya-tee
cd ~/Projects/dojoengine/saya/bin/ops            && cargo build --release --bin saya-ops
```

`bin/integration-test-setup` runs these for you when invoked. Override
binary paths with the env vars `SAYA_TEE_BIN` and `SAYA_OPS_BIN`.

## Why `--mock-prove`

Production Saya uses AMD SEV-SNP attestations: the `saya-tee` enclave
generates a hardware-signed report, and the on-chain Piltover TEE
registry validates the report's certificate chain.

Dev machines typically don't have SEV-SNP hardware, so we use:

- `saya-tee tee start --mock-prove` — synthesizes a stub
  `VerifierJournal` instead of running the real prover. The stub
  encodes the same Poseidon commitment the real attestation would
  carry, so on-chain verification succeeds without any cryptography.
- `piltover_mock_amd_tee_registry` — a permissive TEE registry that
  accepts the stub attestation. Deployed at test start via
  `saya-ops core-contract declare-and-deploy-tee-registry-mock`.

The two MUST go together: real `saya-tee` against the mock registry
would accept arbitrary garbage, and `--mock-prove` against the real
registry would reject the stub journal. The harness pairs them.

## Harness call order

`TestEnv::start` performs these steps in order:

1. Start the settlement Katana (`--dev` mode).
2. Run `katana init rollup` to declare + deploy the standard Piltover
   Appchain core on settlement, generating the rollup chain spec.
3. Run `saya-ops core-contract declare-and-deploy-tee-registry-mock`
   to deploy `piltover_mock_amd_tee_registry` on settlement.
4. Render the appchain dojo profile and start the appchain Katana in
   rollup mode.
5. `sozo build` both profiles, force Play artifact equality across
   them (address-equality invariant), `sozo migrate` both worlds.
6. Spawn `saya-tee tee start --mock-prove ...` as a child process,
   wired to:
   - `--rollup-rpc`: the appchain Katana,
   - `--settlement-rpc`: the settlement Katana,
   - `--settlement-piltover-address`: the core contract from step 2,
   - `--settlement-account-*`: DEV_ACCOUNT_0 on settlement,
   - `--tee-registry-address`: the mock from step 3,
   - `--prover-private-key`: DEV_ACCOUNT_1's privkey (kept distinct
     from the test's main account so Saya's submissions don't
     conflict).
7. `Setup.set_bridge` on both Setups (wires the messaging address),
   seed the Vault.

After this, the harness is ready to drive `Setup.issue` (forward) and
`play_until_finish` / `wait_for_state_root_commit` / `Play.claim`
(reverse).

## Knobs

`saya-tee` flags hard-coded in the harness (`tests/e2e/src/saya.rs`):

- `--batch-size 1` — every appchain block triggers a TEE batch
  immediately. Without this the harness would have to wait for the
  default batch fill before any state root commits.
- `--attestor-poll-interval-ms 250` — faster polling than production
  defaults; keeps the test wall-clock under 1 minute for the reverse
  half.
- `--idle-timeout-secs 5` — flushes a partial batch after 5s idle.

`saya-tee` log is streamed to a per-run temp file and stashed to
`/tmp/nums_e2e_saya-tee.log` on Drop for post-mortem inspection.

## Cleanup

`SayaTeeProcess::drop` calls `start_kill()` on the child. Tempfile
cleanup of the data dir runs after the kill is issued. The log is
copied out before the temp dir is removed, so the failure tail
remains available even after a panic.

## Known limitations

- The harness path-hard-codes default binary locations under
  `~/Projects/dojoengine/saya`. CI environments will need to set
  `SAYA_TEE_BIN` / `SAYA_OPS_BIN` explicitly.
- No retry / restart logic. If `saya-tee` exits mid-test, the
  harness fails — that's intentional; we want loud failures, not
  silent stalls.
- Real-hardware coverage (without `--mock-prove`) is deferred. The
  e2e here proves the plumbing, not the cryptography.
