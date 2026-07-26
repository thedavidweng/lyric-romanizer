# ADR-0004: No unified "variant" seam; three mechanisms stay distinct

## Status

Accepted (2026-07-25)

## Context

"Which romanization system" surfaces three ways: the `dialect` option (Chinese only), automatic Ukrainian/Russian preset selection (Cyrillic, per line), and a fixed `iast` Sanscript scheme (Indic). An architecture review proposed lifting all three behind one variant-resolution seam.

## Decision

Keep the three mechanisms distinct; extract only what testability requires.

1. They differ **by nature**, not by accident: `dialect` is caller intent; the Cyrillic preset is text evidence; the Indic scheme is a fixed choice with exactly one adapter ever used — generalizing it is speculative (no caller has asked).
2. A pure up-front resolver **cannot model Cantonese honestly**: the jyutping→pinyin fallback is a runtime decision (empty result / engine failure → pinyin), so a resolver returning "cantonese" would advertise a determinism the code doesn't have.
3. Replacing the published `dialect` option would break a documented interface (ADR-0001).

What we did instead: extracted `selectCyrillicPreset` as a pure, unit-tested function (the headline Ukrainian feature previously had zero coverage), and documented `dialect` as Chinese-only in types and README.

## Consequences

A future script needing a caller-facing variant should extend `RomanizeOptions`/`RomanizeEngineContext` deliberately at that point, not inherit a premature abstraction. Reviews should not re-propose the unified seam without a second real consumer of variant selection.
