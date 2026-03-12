# Default Workflow

1. Test plan
- Enumerate state transitions and critical invariants.
- Map each invariant to at least one deterministic test.

2. Unit coverage
- Cover success and revert paths for each external write function.
- Assert expected events and post-state.

3. Adversarial coverage
- Add fuzz/property tests for arithmetic and bounds.
- Add replay/order and caller-manipulation tests where applicable.

4. Regression hardening
- Turn every fixed finding into a named regression case.
- Keep failing-before/fixed-after evidence in PR notes.
