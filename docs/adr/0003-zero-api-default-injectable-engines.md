# ADR-0003: Zero-API default with caller-injectable engine adapters

## Status

Accepted (2026-07-25)

## Context

Engines were hard-wired imports: tests could only substitute them by mocking module specifiers, and every downstream consumer re-implemented the same catch-`UnsupportedRomanizationError`-then-call-Google-Translate dance for external scripts. At the same time, "Zero API calls" is the library's headline feature — routing network I/O through the core by default would betray its identity.

## Decision

`createRomanizer({ engines })` accepts per-script engine adapters at one seam:

- **Defaults unchanged**: built-in local engines; external scripts throw. The library itself performs no network I/O, ever.
- Callers may **override** a built-in engine (test fakes; alternative romanizers) or **plug** an adapter for an external script, making `UnsupportedRomanizationError` precisely the no-adapter case.
- Two adapters justify the seam: test fakes (replace-don't-layer through the same door callers use) and caller-supplied external transports.
- *Routing to* a caller-supplied external engine is orchestration and in-scope; *performing* external calls by default is not.

## Consequences

Tests inject fail-once/fake engines through the public factory instead of module mocks. Module mocks remain where the assertion is about *wiring rather than behavior*: the Kuroshiro/Kuromoji constructor call and dictionary path, and the to-jyutping module (whose empty-result and throw fallbacks to Pinyin live inside the Chinese engine, below the injection seam). Downstream can hand its external transport to the romanizer once and stop branching on error types. The `RomanizeEngine` signature is a public semver commitment.
