# Default Workflow

1. Baseline
- Capture pre-change resource profile for target tests.
- Freeze behavior expectations with tests.
- Run `python3 scripts/profile.py profile` to capture a reproducible hotspot baseline.

2. Apply targeted changes
- Replace expensive arithmetic/loop idioms first.
- Optimize storage packing only when reads/writes dominate cost.

3. Validate
- Run full tests and targeted resource report.
- Reject changes that reduce readability without measurable gains.
- Re-profile with the same command/metric settings used for baseline.

4. Document
- Record before/after metrics in the PR.
- Link to the optimization class used from references.
- Link to concrete rewrites in `../references/anti-pattern-pairs.md`.

5. Lock the learning
- Add or update deterministic contract benchmark cases for the optimized pattern.
- Prefer operation-level static rules (for example, `amount / 2`) over variable-name-coupled patterns.
- Update build-generation prompts/checks in `../../evals/cases/contract_skill_generation_eval.jsonl` when optimization guidance changes.
