# Changelog

## 0.3.0 — 2026-07-25

Architecture pass: every piece of per-script knowledge now lives in one table per side of the light/heavy packaging seam, engines are lazy and injectable, and the universal fallback is observable. Public interface changes are **additive**; the two deliberate output-behavior changes are listed below with their rationale.

### Added

- **Engine adapters** — `createRomanizer({ engines })` overrides any built-in engine or plugs an adapter for externally-romanized scripts (`arabic`, `hebrew`, `malayalam`, `bengali`, `other`). The library still performs zero network I/O by default; `UnsupportedRomanizationError` is now precisely "no engine for this script".
- **`RomanizeResult.fallbacks`** — per-line flags, `true` where the script engine failed and the line was universally transliterated as a last resort. Previously this degradation was silent and indistinguishable from success.
- **`requiresExternalRomanization` on the detector subpath** — pure classification moved to the light, engine-free side; `lyric-romanizer/detector` can now answer the full pre-romanization triage (which script → is it latin → needs external) with zero engine payload. Still re-exported from the main entry.
- **`RomanizeEngine`, `RomanizeEngineContext`, `ExternalScript`** exported types.
- **Plain Node ESM support** — `import 'lyric-romanizer'` previously crashed outside bundlers (`@romanize/korean` named-export interop); engines now load through interop-safe dynamic imports.
- **Lazy engine loading** — every engine loads on first use. Importing the main entry no longer executes any engine package; a Korean-only consumer never loads pinyin-pro or kuroshiro. Failed loads retry on the next call and degrade to the universal fallback (flagged) rather than crashing playback.

### Changed — deliberate output-behavior changes

1. **Latin guard under a pinned script.** `romanizeLines` pins one script for the whole array; lines with ASCII letters and no character of any detectable script are now returned unchanged instead of being fed to the pinned engine. Before: `romanizeLines(['Hello', '世界'])` → `['H e l l o', 'shì jiè']` (pinyin-pro spaces out Latin text). After: `['Hello', 'shì jiè']`. Rationale: the engine cannot romanize what isn't its script; the old output was mangled.
2. **Out-of-contract script strings throw.** Untyped callers pinning a string outside `ScriptType` (e.g. `{ script: 'greek' }`) now get `UnsupportedRomanizationError` instead of a silent universal transliteration. This includes names inherited from `Object.prototype`: `{ script: 'toString' }` previously resolved to the inherited method and returned `'[object Undefined]'`. Unaffected: auto-detected scripts (detection only ever returns `ScriptType` members), and empty or letterless lines, which short-circuit to a no-op before any script is consulted — as they always did.

All romanized output strings are byte-identical to 0.2.0 apart from those two cases, verified against a golden corpus across every supported script, dialect, preset, and error path. Two further notes for anyone diffing behavior:

- `romanizeLine` with an engineless pinned script (e.g. `{ script: 'arabic' }`) still throws even when the line is pure Latin — the engine check precedes the latin guard, matching `romanizeLines`, which rejects such a script before looking at any line.
- `NON_LATIN_SCRIPT_RE` is now derived from the range table, so its `.source` text changed: ranges are emitted in ascending code-point order, and the adjacent Hebrew and Arabic ranges collapse into one (8 groups → 7). The matching contract is unchanged — `.flags` is still `''` and `.test()` agrees with the old literal for every code point in the BMP, asserted by a test sweep. Only a consumer that snapshots, hashes, or string-compares the pattern text is affected; one that uses it as a matcher is not.

### Fixed

- README Quick Start example was impossible: `romanizeLines(['你好世界', 'こんにちは'])` returns `{ script: 'japanese' }` (kana is definitive), not `{ script: 'chinese' }` as documented. The example and the detection-granularity contract are now documented accurately.
- Documented romanization outputs corrected against the actual engines (in all nine READMEs): Thai `สวัสดี` → `swasdi` (was `sawatdi`), Gurmukhi `ਨਮਸਤੇ` → `namasate` (was `namaste`; standard Punjabi spelling has no virama, so both consonants keep the inherent vowel), and the Kannada sample is now the correctly-spelled `ನಮಸ್ತೇ` → `namaste`. The feature list said "7 Indic scripts"; there are 6.
- Dead defensive throws in the Sanscript branch (unreachable behind the catch-all fallback) removed; the silent `default:` switch arm is gone — the engine table is total over the script union, so a forgotten engine row is a **compile error** instead of silent garbage.
- `NON_LATIN_SCRIPT_RE` is now derived from the same per-script range table that drives detection (previously a hand-maintained duplicate with a "keep aligned" comment). Verified byte-for-byte identical across the BMP.

### Internal

- Per-script knowledge concentrated: detection ranges + external classification in `SCRIPT_METADATA` (detector side), engine bindings in one total record (romanizer side). Adding a script is one row per side, compiler-enforced.
- `selectCyrillicPreset` extracted as a pure, unit-tested function (the Ukrainian-detection headline feature previously had zero coverage).
- Dependencies updated to latest (TypeScript 7, vitest 4.1.10, pinyin-pro 3.28.2). CI, Dependabot (daily, grouped), and a weekly latest-deps canary keep every engine on its newest release.
- Test suite grew from 19 to 44 tests: injection seam, fallback observability, lazy-init retry, preset selection, latin guard, regex-derivation equivalence, tie-break regression, BMP-range invariant.
- `pnpm run smoke` (`scripts/smoke.mjs`) exercises the built package under plain Node ESM: every engine's interop chain, the fallback path, both entry points, and an assertion that `dist/detector.js` imports nothing. Runs in CI and in the canary; `pnpm run verify` chains typecheck + build + test + smoke.
- `package.json` declares `"sideEffects": false` (safe now that engines are lazy) and ships `src` so the published source maps resolve.
