# ADR-0002: romanizeLines pins one whole-array script; no per-line resolution

## Status

Accepted (2026-07-25)

## Context

`romanizeLines` detects the dominant script once and pins it to every line, while a `romanizeLine` loop detects per line. An architecture review proposed making `romanizeLines` resolve scripts per line (dominant script only as a tiebreaker) so mixed-script arrays route each line to its own engine.

## Decision

Keep the whole-array pin. The per-line-resolution rework is rejected because:

1. **The Han block defeats it.** Kanji and hanzi share `U+4E00–9FFF`; detection cannot distinguish a "clearly Chinese" line from an "ambiguous kanji-only" line, so ambiguous lines re-pin to the dominant script anyway — the rework cannot fix the very mixed-CJK case that motivates it.
2. **It changes the `result.script` contract** (from "the script every line was romanized as" to "dominant script; lines may differ") on a published interface with known consumers, violating ADR-0001 for marginal gain.
3. The only lines it would genuinely re-route are clearly-distinct scripts inside a foreign-script song — rare in lyrics, and mostly covered by the narrower fix below.

Instead:

- The **latin guard** handles the common real case (an English chorus inside a CJK song) without touching the contract: pure-Latin lines under a pinned script are returned unchanged.
- The granularity difference is **documented interface**, not tribal knowledge (README "Mixed-script arrays").

## Consequences

Callers needing true per-line routing loop over `romanizeLine`. Future reviews should not re-propose per-line resolution inside `romanizeLines` unless the Han-ambiguity problem gains a real solution (e.g. a CJK language classifier).
