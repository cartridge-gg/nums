# Default Workflow

1. Scope
- Define contract responsibilities and explicit non-goals.
- Freeze external interface signatures before deep implementation.

2. Language sanity
- Confirm ownership/ref semantics for mutable paths.
- Confirm trait/generic constraints for shared components.

3. State model
- Encode invariants in storage layout and typed wrappers.
- Separate privileged and unprivileged mutation paths.

4. Surface hardening
- Minimize public selectors.
- Add strict argument validation and auth checks.
- For timelocked paths, source time from `get_block_timestamp()` only.
- For upgrade paths, reject zero class hash values.

5. Test-first tightening
- Add unit tests for nominal/failure paths.
- Add property/fuzz tests for invariant-sensitive logic.

6. Security review
- Run `references/audit-handoff.md` flow.
- Execute local deterministic preflight:
  `python scripts/quality/audit_local_repo.py --repo-root /path/to/repo --scan-id handoff-audit`
- Run `cairo-auditor` in default mode for deep finding narratives.
- Patch findings and add regression tests.

7. Distill findings into skills
- Encode each fixed class of issue in `../references/legacy-full.md`.
- Add explicit anti-pattern/secure-pattern snippets in `../references/anti-pattern-pairs.md`.
- Add/adjust deterministic checks in `../../evals/cases/contract_skill_benchmark.jsonl`.
- For generation quality tracking, update `../../evals/cases/contract_skill_generation_eval.jsonl` prompts/checks when authoring guidance changes.
