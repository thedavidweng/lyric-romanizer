# Domain glossary

Terms used by this codebase, its docs, and its architecture decisions. Use these words exactly.

## Script

A writing system a lyric line can be in. The closed union `ScriptType` (18 members) is the contract every table in the codebase is checked against. Three kinds:

- **Local script** — has a built-in engine (japanese, chinese, korean, cyrillic, 6 Indic scripts, tamil, thai).
- **External script** — no built-in engine; romanization requires an external service (malayalam, bengali, arabic, hebrew, other). Classified by `requiresExternalRomanization` on the light side.
- **latin** — needs no romanization; always a no-op.

## Script metadata table

`SCRIPT_METADATA` in `src/detector.ts` — the single source of truth for per-script knowledge on the light side: Unicode detection ranges, the kana-definitive flag, and local/external classification. `SCRIPT_SCORES`, `NON_LATIN_SCRIPT_RE`, and `requiresExternalRomanization` are derived from it. **Entry order is the tie-break priority of detection.**

## Engine

An adapter that romanizes one line of one script: `(line, context) => string | Promise<string>`. Built-in engines live in one total record in `src/romanizer.ts` — total over the local scripts, so a missing row is a compile error, not a silent fallthrough. Callers may override any engine or plug adapters for external scripts through `createRomanizer({ engines })`. Every built-in engine is a thin binding over a dedicated community library ("don't reinvent the wheel").

## Light/heavy packaging seam

The package's three entries: `.` (the romanizer; engine bindings, all lazy), `./detector` (detection + classification; zero engine dependencies, ships nothing but pure data and logic), and `./dict` (Node / build-time only; locates the kuromoji dictionary so a consumer can vendor it). Knowledge is placed by what it needs: classification is light, engine invocation is heavy, dictionary resolution is Node-only. Nothing on the light side may import an engine. The dict entry must not be imported from the main entry or a browser/worker bundle.

## Warmup

`Romanizer.warmup` eagerly loads a built-in engine (and, for Japanese, initializes the kuromoji dictionary) without romanizing a line. It is the idle-time counterpart of lazy loading: first-use cost moves to a moment the caller chooses. Overridden engines are skipped. Failed loads reject — warmup is not the universal-fallback path.

## Detection

`detectScript`: kana is **definitive** (any kana → japanese, checked before scoring, because kanji shares the Han block with Chinese hanzi); otherwise scripts are scored by character count over their ranges, ties broken by table order; letters with no script match → latin; no letters → other.

## Detection granularity

`romanizeLine` without an explicit script detects **per line**. `romanizeLines` detects **once across the whole array** and pins the dominant script to every line — deliberate, so ambiguous kanji-only lines inside a Japanese song reach the Japanese engine. The difference is part of the documented interface.

## Latin guard

Under a *pinned* script, a line with ASCII letters and no character of any detectable script is returned unchanged instead of being fed to the pinned engine (which would mangle it — pinyin-pro spaces "Hello" into "H e l l o").

## Universal fallback

The product rule "lyrics must always render": when an engine (or its lazy load) fails, the line degrades to plain `transliteration` output instead of throwing. Observable per line via `RomanizeResult.fallbacks`. The Cantonese jyutping→pinyin fallback is a *variant* fallback inside the Chinese engine, not a universal fallback, and is not flagged.

## Variant

A script-internal choice of romanization system. Three deliberately distinct mechanisms (see ADR-0004):

- **dialect** — caller intent, Chinese only: `'mandarin'` (Pinyin, default) or `'cantonese'` (Jyutping).
- **Cyrillic preset** — text evidence, per line: Ukrainian-specific characters (`і ї є ґ`) select the `uk` preset (`selectCyrillicPreset`), otherwise `ru`.
- **Indic scheme** — fixed: Sanscript output is always `iast`.

## Zero-API default

The library itself never performs network I/O (the kuromoji dictionary fetch being the caller-configurable exception). External scripts throw `UnsupportedRomanizationError` unless the caller injects an adapter — routing to a caller-supplied external engine is orchestration; *performing* external calls by default is not.
