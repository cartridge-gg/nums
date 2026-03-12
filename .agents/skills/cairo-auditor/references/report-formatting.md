# Report Formatting

Use this exact structure for each finding.

## Finding Template

`[P{priority}] **{title}**`

`Location: {file}:{line}`

`Class: {class_id} | Confidence: [{score}] | Severity: {severity}`

`Description:`

- One paragraph explaining exploit path and impact.

`Fix:`

```diff
- vulnerable line(s)
+ fixed line(s)
```

`Required tests:`

- Regression test that reproduces the vulnerable path.
- Guard test that proves fix blocks exploit.

## Priority Mapping

- `P0`: direct loss, permanent lock, or upgrade takeover.
- `P1`: high-impact auth/logic flaw with realistic exploit path.
- `P2`: medium-impact misconfiguration or constrained exploit.
- `P3`: low-impact hardening issue.

## Confidence Threshold Rule

- Findings with confidence `<75` can be reported, but omit the `Fix` diff block.
- Findings that fail FP gate must be dropped and not reported.

## Deduplication Rule

When two findings share the same root cause, keep one:

- keep higher confidence,
- merge broader attack path details,
- keep a single fix/test block.
