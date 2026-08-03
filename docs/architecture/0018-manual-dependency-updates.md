# 0018. Dependency updates are deliberate and manual

## Status

Accepted. Supersedes the Dependabot part of [0009](0009-ci-quality-gate-before-deploy.md).

## Context

Dependabot grouped packages by broad name patterns rather than by a framework's actual
compatibility matrix. Its Angular 22 PR updated Angular without the required TypeScript and
Angular ESLint versions, breaking `npm ci` on `main`. The regenerated dev-tooling update
then proposed TypeScript 7 while Angular 22.1 explicitly requires TypeScript 6.0.

For this small personal project, repeated incompatible PRs and failed branch runs cost more
attention than a scheduled bot saves.

## Decision

The repository has no `.github/dependabot.yml`. npm packages and pinned GitHub Actions are
updated manually as coherent sets, with the framework compatibility ranges checked before
the lock file changes.

The CI safety net remains: every push performs a clean `npm ci`, audits production
dependencies, and runs the complete quality gate before deployment.

## Consequences

- Dependabot version-update PRs are no longer created from repository configuration.
- Angular, TypeScript, Angular ESLint and the build tooling must be upgraded together.
- Pinned Actions no longer move automatically; their trailing version comments make the
  manual review targets visible.
- The owner must periodically review `npm outdated` and production audit results. CI still
  blocks a deploy when `npm audit --omit=dev --audit-level=moderate` fails.
- Dependabot security features controlled in GitHub repository settings are separate from
  this file and must be disabled there as well if they are enabled.
