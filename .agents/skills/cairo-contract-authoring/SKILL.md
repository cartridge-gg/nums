---
name: cairo-contract-authoring
description: Guides Cairo smart-contract authoring on Starknet with language fundamentals, safe structure choices, component composition, and implementation workflow references.
license: Apache-2.0
metadata: {"author":"starknet-skills","version":"0.2.0","org":"keep-starknet-strange","source":"starknet-agentic","contributors":["kronosapiens/dojoengine"]}
keywords: [cairo, contracts, starknet, language, ownership, traits, openzeppelin, components, storage, interfaces]
allowed-tools: [Bash, Read, Write, Glob, Grep, Task]
user-invocable: true
---

# Cairo Contract Authoring

Use this as the entrypoint for implementation decisions; load references only as needed.

## When to Use

- Checking Cairo language fundamentals that directly affect contract behavior (ownership, refs, traits, generics).
- Writing a new Starknet contract.
- Modifying storage/events/interfaces.
- Composing OpenZeppelin Cairo components.

## When NOT to Use

- Gas/performance tuning (`cairo-optimization`).
- Test strategy design (`cairo-testing`).
- Deployment and release operations (`cairo-toolchain`).

## Quick Start

1. Define interface and storage boundaries first.
2. Implement minimal external/write surface.
3. Add explicit auth and invariant checks.
4. Add tests before broadening feature surface.
5. Run the authoring-to-audit handoff flow, then `cairo-auditor`.

## Security-Critical Rules

- Timelock checks must read time from Starknet syscalls (`get_block_timestamp`), never from caller-provided arguments.
- Every `#[external(v0)]` function that mutates storage must have explicit access posture:
  - guarded (`assert_only_owner` / role checks), or
  - intentionally public with a code comment stating why.
- Upgrade flows must reject zero class hash inputs before applying state transitions.
- Use anti-pattern/secure-pattern pairs to keep authoring behavior explicit and reviewable.
- If any of these rules fail in fixture benchmarks, update both:
  - skill/reference text, and
  - deterministic cases in `../evals/cases/contract_skill_benchmark.jsonl`, and
  - generation cases in `../evals/cases/contract_skill_generation_eval.jsonl`.

## Workflow

- Main authoring flow: [default workflow](workflows/default.md)

## References

- Detailed authoring reference: [legacy reference](references/legacy-full.md)
- Cairo language fundamentals reference: [language reference](references/language.md)
- Build-side anti-pattern pairs: [anti-pattern pairs](references/anti-pattern-pairs.md)
- Authoring to audit execution path: [audit handoff](references/audit-handoff.md)
- Module index: [references index](references/README.md)
