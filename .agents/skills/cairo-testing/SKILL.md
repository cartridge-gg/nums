---
name: cairo-testing
description: Provides Cairo smart-contract testing strategy with progressive references for snforge unit, integration, fuzz, and fork tests.
license: Apache-2.0
metadata: {"author":"starknet-skills","version":"0.1.1","org":"keep-starknet-strange","source":"starknet-agentic"}
keywords: [cairo, testing, snforge, starknet-foundry, fuzzing, integration]
allowed-tools: [Bash, Read, Write, Glob, Grep, Task]
user-invocable: true
---

# Cairo Testing

Use this entrypoint to choose test scope and sequence, then load specific patterns from references.

## When to Use

- Building unit, integration, fuzz, or fork tests.
- Designing regression tests for known findings.
- Validating event and failure semantics.

## When NOT to Use

- Contract architecture decisions (`cairo-contract-authoring`).
- Performance tuning (`cairo-optimization`).
- Deployment operations (`cairo-toolchain`).

## Quick Start

1. Add unit tests for all state-mutating selectors.
2. Add negative tests for auth/input failures.
3. Add at least one fuzz/property test for core invariants.
4. Convert fixed findings into permanent regression tests.
5. Run `cairo-auditor`; fix or explicitly triage/document new findings first, then add regression tests before merge.

## Workflow

- Main testing flow: [default workflow](workflows/default.md)

## References

- Detailed testing reference: [legacy reference](references/legacy-full.md)
- Module index: [references index](references/README.md)
- Security regression recipes: `../datasets/distilled/test-recipes/`
