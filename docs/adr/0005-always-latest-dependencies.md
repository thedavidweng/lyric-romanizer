# ADR-0005: Always track the latest release of every composed engine

## Status

Accepted (2026-07-25)

## Context

The library's philosophy is to compose best-in-class community romanization engines rather than build its own. That only holds if the composition actually ships the engines' newest data and fixes — pinning to stale versions silently forfeits upstream improvements (new dictionary entries, corrected romanizations).

## Decision

Dependencies are kept on their latest releases, permanently, by machinery rather than memory:

- **Dependabot** (`.github/dependabot.yml`): daily npm checks; minor/patch updates grouped into one PR, majors as individual PRs; GitHub Actions updated weekly.
- **CI** (`.github/workflows/ci.yml`): typecheck, build, full test suite, and a plain-Node ESM smoke test gate every update PR.
- **Latest-deps canary** (`.github/workflows/deps-canary.yml`): weekly `pnpm update --latest` + build + test against the absolute newest of everything, surfacing upstream breakage before it reaches a PR.

Tension with ADR-0001 (outputs are a contract) is resolved by the test suite: output-sensitive tests and the smoke test fail an update PR whose engine changes observable romanization, forcing a conscious, changelogged decision instead of a silent drift.

## Consequences

Update PRs are routine and small. An engine's major release that changes output is a deliberate review, not a surprise. `pnpm outdated` should normally be empty.
