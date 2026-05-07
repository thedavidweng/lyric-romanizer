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
- **12+ scripts** — Japanese, Chinese, Korean, Cyrillic, 7 Indic scripts, Tamil, Thai
- **Cantonese support** — Jyutping alongside default Mandarin Pinyin
- **Lightweight detector subpath** — import only script detection without pulling in romanization engines
- **Ukrainian-aware Cyrillic** — auto-detects Ukrainian-specific characters and applies the correct transliteration preset

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
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// Romanize a single line
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

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
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### Types

```ts
type ScriptType =
  | 'japanese' | 'chinese' | 'korean' | 'cyrillic'
  | 'devanagari' | 'gujarati' | 'gurmukhi' | 'telugu'
  | 'kannada' | 'odia' | 'tamil' | 'malayalam'
  | 'bengali' | 'arabic' | 'hebrew' | 'thai'
  | 'other';

interface Romanizer {
  romanizeLine(line: string, options?: RomanizeOptions): Promise<string>;
  romanizeLines(lines: readonly string[], options?: RomanizeOptions): Promise<RomanizeResult>;
}

type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };
type RomanizeResult = { script: ScriptType; lines: string[] };
type RomanizerOptions = { japaneseDictPath?: string };
```

### `createRomanizer(options?)`

Factory that returns a `Romanizer` instance. The Kuroshiro engine (Japanese) is lazily initialized on first use and cached.

```ts
const romanizer = createRomanizer();

// Override the Kuromoji dictionary CDN path (e.g. for self-hosting)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

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

Returns `true` for scripts that cannot be romanized locally and require an external API.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

Romanizes a single line. If `script` is omitted, it is auto-detected via `detectScript`. Returns the original line unchanged for Latin text or non-letter content.

For Chinese text, the `dialect` option controls the romanization system: `'mandarin'` (default) uses Pinyin, `'cantonese'` uses [Jyutping](https://github.com/CanCLID/to-jyutping).

**Throws** `UnsupportedRomanizationError` for external scripts.

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

Romanizes multiple lines in parallel. Returns the detected script and romanized lines.

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

Thrown when attempting to romanize a script that requires an external API. Has a `script` property for programmatic handling.

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
| Gurmukhi | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| Telugu | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| Kannada | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| Odia | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| Tamil | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| Thai | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### External (requires API)

| Script | Method |
|--------|--------|
| Malayalam | Google Translate `dt=rm` |
| Bengali | Google Translate `dt=rm` |
| Arabic | Google Translate `dt=rm` |
| Hebrew | Google Translate `dt=rm` |
| Other | Google Translate `dt=rm` |

Use `requiresExternalRomanization()` to detect these and branch to your preferred API.

## Script-Specific Notes

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
