# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

Script detection and local romanization engine for lyrics. Supports 12 scripts across Japanese, Chinese, Korean, Cyrillic, Indic, Tamil, and Thai — all running locally with zero API calls.

Extracted from [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke). Used by [OpenKara](https://github.com/thedavidweng/openkara).

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

type RomanizeOptions = { script?: ScriptType };
type RomanizeResult = { script: ScriptType; lines: string[] };
type RomanizerOptions = { japaneseDictPath?: string };
```

### Functions

#### `createRomanizer(options?)`

Factory that returns a `Romanizer` instance. The Kuroshiro engine (Japanese) is lazily initialized on first use and cached.

```ts
const romanizer = createRomanizer();

// Override the Kuromoji dictionary CDN path (e.g. for self-hosting)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

#### `detectScript(lines)`

Detects the dominant script in the given text lines. Checks for Japanese kana first (definitive), then scores all other scripts by character count.

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

#### `isLatinScript(lines)`

Fast check — returns `true` if the text contains only Latin letters (no CJK, Cyrillic, Indic, etc.). Useful for skipping romanization entirely.

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (no letters)
```

#### `requiresExternalRomanization(script)`

Returns `true` for scripts that cannot be romanized locally and require an external API.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `Romanizer` Interface

#### `romanizer.romanizeLine(line, options?)`

Romanizes a single line. If `script` is omitted, it is auto-detected via `detectScript`. Returns the original line unchanged for Latin text or non-letter content.

**Throws** `UnsupportedRomanizationError` for external scripts.

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè'

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (no-op)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

#### `romanizer.romanizeLines(lines, options?)`

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
| Korean | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| Cyrillic | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| Devanagari | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| Gujarati | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| Gurmukhi | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| Telugu | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| Kannada | [sanscript](https://github.com/indic-transliteration/sanscript) | `నಮస్తె` → `namaste` |
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

## Cyrillic Detection

Cyrillic auto-detects Ukrainian-specific characters (`і`, `ї`, `є`, `ґ`) and applies the Ukrainian transliteration preset. All other Cyrillic text defaults to Russian.

## License

MIT
