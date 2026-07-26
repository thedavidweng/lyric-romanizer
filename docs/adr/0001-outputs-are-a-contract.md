# ADR-0001: Romanization outputs are a public contract

## Status

Accepted (2026-07-25)

## Context

lyric-romanizer is consumed by downstream projects (Spotify Karaoke, OpenKara) that render its output directly to users. A change in romanized output — even an "improvement" — is a user-visible behavior change in every consumer.

## Decision

The byte-level output of `romanizeLine` / `romanizeLines` for a given input is treated as part of the public interface:

- Refactors must be verified against a golden corpus covering every supported script, dialect, preset, and error path. Byte-identical output is the default requirement.
- Deliberate output changes are allowed only with a clear correctness rationale, and must be listed prominently in the CHANGELOG so downstream can follow.
- Dependency updates that change engine output are surfaced the same way (see ADR-0005).

## Consequences

The 0.3.0 architecture pass changed output in exactly two documented cases (latin guard; out-of-contract script strings) and proved everything else identical via golden diff. Future passes follow the same discipline.
