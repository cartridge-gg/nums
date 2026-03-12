---
name: cairo-optimization
description: Improves Cairo performance after correctness is established, including hotspot profiling, arithmetic/loop optimization, and bounded-int hardening.
license: Apache-2.0
metadata: {"author":"feltroidprime","contributors":["starknet-agentic"],"version":"1.2.0","org":"keep-starknet-strange","upstream":"https://github.com/feltroidprime/cairo-skills","upstream_commit":"7fde29f","sync_date":"2026-03-08","upstream_paths":["skills/cairo-coding","skills/benchmarking-cairo"],"permission_ref":"maintainer-confirmed-2026-03-08"}
keywords: [cairo, optimization, profiling, benchmarking, gas, bounded-int, storage-packing, arithmetic, starknet]
allowed-tools: [Bash, Read, Write, Glob, Grep, Task]
user-invocable: true
---

# Cairo Optimization

Apply only after tests pass and behavior is locked.

## When to Use

- Improving gas/resource usage in hot paths.
- Rewriting expensive loops/arithmetic patterns.
- Optimizing storage layout and integer choices.

## When NOT to Use

- Early feature prototyping without tests.
- Security review as a substitute for correctness proofs.

## Quick Start

1. Confirm baseline behavior with tests.
2. Profile target paths with `python3 scripts/profile.py profile`.
3. Apply one optimization class at a time.
4. Re-run tests and compare resource deltas.
5. Use anti-pattern/secure-pattern pairs to keep micro-optimizations explicit.
6. Encode stable optimization rules in `../evals/cases/contract_skill_benchmark.jsonl` to prevent regressions.
7. Run `cairo-auditor` on touched files to ensure no security regressions were introduced.

## Workflow

- Main optimization flow: [default workflow](workflows/default.md)

## References

- Detailed optimization rules: [legacy reference](references/legacy-full.md)
- Profiling workflow and troubleshooting: [profiling reference](references/profiling.md)
- Optimization anti-pattern pairs: [anti-pattern pairs](references/anti-pattern-pairs.md)
- Module index: [references index](references/README.md)
