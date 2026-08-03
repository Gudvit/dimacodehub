# 0017. CI enforces a global unit coverage floor

## Status

Accepted.

## Context

The Angular unit-test builder runs 31 tests, but the repository did not measure how much
application code they exercise. A green test run could therefore hide a large untested
addition, and CI had no objective signal for that regression.

Coverage must include files that no current spec imports. Measuring only the modules loaded
by the tests gives a reassuring number while excluding precisely the code most likely to be
untested.

## Decision

`npm run test:unit:coverage` runs the existing Angular/Vitest test target with V8 coverage.
It includes every `src/app/**/*.ts` file, excludes specs, and prints a text summary. CI uses
this command for its unit-test step; local `npm run test:unit` stays fast and unchanged.

The global minimums are:

| Metric     | Floor | Baseline when introduced |
| ---------- | ----: | -----------------------: |
| Statements |   50% |                   54.01% |
| Branches   |   65% |                   70.39% |
| Functions  |   55% |                   58.42% |
| Lines      |   50% |                   52.20% |

The floors deliberately sit below the measured baseline. They reject a meaningful drop
without making an unrelated change fail because a few new lines are not covered yet.

## Consequences

- A push cannot deploy when coverage falls below any floor.
- New application files count even when no test imports them.
- The thresholds are global, not per-file: data-heavy or declarative modules do not need
  artificial tests merely to satisfy a local percentage.
- Raising the floors is encouraged when coverage improves; lowering one requires recording
  why the existing level is no longer representative.
