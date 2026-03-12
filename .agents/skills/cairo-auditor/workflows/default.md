# Default Workflow

1. Discover in-scope Cairo files.
2. Prepare 4 specialist bundles (full code + one attack-vector partition each).
3. Run 4 vector specialists in parallel (triage -> deep pass -> FP gate).
4. Require report formatting contract (`references/report-formatting.md`) for every finding.
5. Merge and dedupe by root cause; run composability pass for interacting findings.
6. Run Sierra confirmation for upgrade/CEI classes when Scarb is available.
7. Emit prioritized findings + required regression tests.
