# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

> **Philosophy: Don't reinvent the wheel.**
> This project deliberately avoids building romanization logic from scratch. Instead, it composes best-in-class, community-maintained libraries — one for each script — and focuses on the orchestration layer: script detection, engine routing, dialect handling, and a unified API. Every romanization engine in the dependency list is a dedicated, battle-tested library maintained by domain experts. That's the point.

Script detection and local romanization engine for lyrics. Supports 12 scripts across Japanese, Chinese (Mandarin and Cantonese), Korean, Cyrillic, Indic, Tamil, and Thai — all running locally with zero API calls.

Extracted from [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke). Used by [OpenKara](https://github.com/thedavidweng/openkara).

## Features

- **Zero API calls** — all romanization runs locally
- **Auto script detection** — pass in text, get back the detected script
- **12+ scripts** — Japanese, Chinese, Korean, Cyrillic, 6 Indic scripts, Tamil, Thai
- **Cantonese support** — Jyutping alongside default Mandarin Pinyin
- **Lightweight detector subpath** — import only script detection (and external-script classification) without pulling in romanization engines
- **Lazy engines** — every engine loads on first use; importing the main entry costs nothing until you romanize
- **Pluggable engines** — override any built-in engine, or plug your own adapter for externally-romanized scripts
- **Observable fallbacks** — per-line flags tell you when an engine failed and a line was transliterated as a last resort
- **Ukrainian-aware Cyrillic** — auto-detects Ukrainian-specific characters and applies the correct transliteration preset
- **Runs in plain Node ESM** — no bundler required

## Installation

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## Quick Start

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// Auto-detect script and romanize
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// Romanize a single line
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **Detection granularity** — `romanizeLines` detects the dominant script **once across all lines** and pins it for every line (deliberate: kanji-only lines inside a Japanese song must reach the Japanese engine, and any kana in the array pins `japanese`). Calling `romanizeLine` in a loop instead detects **per line** and may route each line to a different engine. Pure-Latin lines under a pinned script are returned unchanged. See [Mixed-script arrays](#mixed-script-arrays).

## API

### Imports

```ts
// Main entry — full romanization engine
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// Detector-only subpath — lightweight, no romanization dependencies
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';
```

### Types

```ts
type ScriptType =
  | 'japanese' | 'chinese' | 'korean' | 'cyrillic'
  | 'devanagari' | 'gujarati' | 'gurmukhi' | 'telugu'
  | 'kannada' | 'odia' | 'tamil' | 'malayalam'
  | 'bengali' | 'arabic' | 'hebrew' | 'thai'
  | 'latin' | 'other';

interface Romanizer {
  romanizeLine(line: string, options?: RomanizeOptions): Promise<string>;
  romanizeLines(lines: readonly string[], options?: RomanizeOptions): Promise<RomanizeResult>;
}

// `dialect` is only honored for 'chinese'; every other script ignores it.
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` is aligned with `lines`: true where the engine failed and the
// line was universally transliterated as a last resort.
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// An engine adapter: romanizes one line of its script. Throwing (or
// rejecting) triggers the universal transliteration fallback.
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

Factory that returns a `Romanizer` instance. Every engine is lazily loaded on first use and cached — a failed load retries on the next call.

```ts
const romanizer = createRomanizer();

// Override the Kuromoji dictionary CDN path (e.g. for self-hosting)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

#### Engine adapters

`options.engines` overrides the built-in engine for a script — or plugs an engine into a script that has none built in (`arabic`, `hebrew`, `malayalam`, `bengali`, `other`), so `romanizeLines` can handle every script through one interface. By default the library performs **zero network I/O**; plugging a remote adapter is an explicit caller decision.

```ts
const romanizer = createRomanizer({
  engines: {
    // Bring your own external romanization for scripts without a local engine.
    arabic: async (line) => myTransliterationApi(line),
    // Or replace a built-in engine (e.g. with a fake in tests).
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — no longer throws
```

Scripts without an engine — built-in or injected — still throw `UnsupportedRomanizationError`.

### `detectScript(lines)`

Detects the dominant script in the given text lines. Checks for Japanese kana first (definitive), then scores all other scripts by character count.

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

Fast check — returns `true` if the text contains only Latin letters (no CJK, Cyrillic, Indic, etc.). Useful for skipping romanization entirely.

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (no letters)
```

### `requiresExternalRomanization(script)`

Returns `true` for scripts that have no built-in engine and require an external API. Importable from the lightweight `lyric-romanizer/detector` subpath, so answering "should I branch to an external service?" costs zero engine payload.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

Romanizes a single line. If `script` is omitted, it is auto-detected **per line** via `detectScript` — looping over `romanizeLine` may route each line to a different engine, unlike `romanizeLines`, which pins one script for the whole array. Returns the original line unchanged for Latin text or non-letter content.

For Chinese text, the `dialect` option controls the romanization system: `'mandarin'` (default) uses Pinyin, `'cantonese'` uses [Jyutping](https://github.com/CanCLID/to-jyutping). Other scripts ignore `dialect`.

**Throws** `UnsupportedRomanizationError` for scripts without an engine (built-in or injected).

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè' (default: Mandarin/Pinyin)

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (no-op)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

Romanizes multiple lines in parallel. Detects the dominant script **once across all lines** and pins it for every line (see [Mixed-script arrays](#mixed-script-arrays)). Returns the script, the romanized lines, and per-line `fallbacks` flags — `true` where the engine failed and the line was universally transliterated as a last resort.

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

Thrown when attempting to romanize a script that has no engine — built in or injected via `options.engines`. Has a `script` property for programmatic handling.

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // fall back to external API
  }
}
```

## Supported Scripts

### Local (fully offline)

| Script | Engine | Example |
|--------|--------|---------|
| Universal *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| Japanese | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| Mandarin | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| Cantonese | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| Korean | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| Cyrillic | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| Devanagari | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| Gujarati | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| Gurmukhi | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| Telugu | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| Kannada | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| Odia | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| Tamil | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| Thai | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### External (requires API)

| Script | Method |
|--------|--------|
| Malayalam | Google Translate `dt=rm` |
| Bengali | Google Translate `dt=rm` |
| Arabic | Google Translate `dt=rm` |
| Hebrew | Google Translate `dt=rm` |
| Other | Google Translate `dt=rm` |

Use `requiresExternalRomanization()` to detect these and branch to your preferred API — or plug the API in once as an [engine adapter](#engine-adapters) and let `romanizeLines` handle every script.

## Script-Specific Notes

### Mixed-script arrays

`romanizeLines` pins the **dominant** script of the whole array to every line. This is deliberate: a kanji-only line inside a Japanese song is indistinguishable from Chinese on its own (kanji and hanzi share the same Unicode block), so only whole-array context routes it to the right engine. Consequences worth knowing:

- Any kana anywhere in the array pins the whole array to `japanese` — kana is definitive proof.
- A line of a *different* non-Latin script inside the array is still fed to the pinned engine.
- Pure-Latin lines (an English chorus inside a CJK song) are **returned unchanged** instead of being fed to the pinned engine.
- Per-line `fallbacks` flags report when an engine failed and a line degraded to universal transliteration.

If you need true per-line engine routing, call `romanizeLine` in a loop — it detects per line.

### Cyrillic Detection

Cyrillic auto-detects Ukrainian-specific characters (`і`, `ї`, `є`, `ґ`) and applies the Ukrainian transliteration preset. All other Cyrillic text defaults to Russian.

### Cantonese Support

Chinese text defaults to Mandarin (Pinyin). Pass `dialect: 'cantonese'` in `RomanizeOptions` to romanize Chinese text to [Jyutping](https://github.com/CanCLID/to-jyutping) instead.

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## License

MIT
