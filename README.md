# lyric-romanizer

Script detection and local romanization engine for lyrics. Supports Japanese, Chinese, Korean, Cyrillic, Indic scripts (Devanagari, Gujarati, Gurmukhi, Telugu, Kannada, Odia), Tamil, Thai, and Latin.

Extracted from [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke).

## Install

```bash
npm install lyric-romanizer
```

## API

```ts
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
} from 'lyric-romanizer';

// Subpath import for detector only
import { detectScript } from 'lyric-romanizer/detector';
```

### `detectScript(lines: readonly string[]): ScriptType`

Detects the dominant script in the given lines. Returns one of: `japanese`, `chinese`, `korean`, `cyrillic`, `devanagari`, `gujarati`, `gurmukhi`, `telugu`, `kannada`, `odia`, `tamil`, `malayalam`, `bengali`, `arabic`, `hebrew`, `thai`, `latin`, `other`.

### `isLatinScript(lines: readonly string[]): boolean`

Fast check for whether the text is Latin-only (no non-Latin characters).

### `requiresExternalRomanization(script: ScriptType): boolean`

Returns `true` for scripts that cannot be romanized locally (`malayalam`, `bengali`, `arabic`, `hebrew`, `other`).

### `createRomanizer(options?: { japaneseDictPath?: string }): Romanizer`

Creates a romanizer instance. The optional `japaneseDictPath` overrides the default [Kuromoji](https://github.com/takuyaa/kuromoji.js) dictionary CDN path.

### `Romanizer.romanizeLine(line: string, options?: { script?: ScriptType }): Promise<string>`

Romanizes a single line. If `script` is omitted, it is auto-detected.

### `Romanizer.romanizeLines(lines: readonly string[], options?: { script?: ScriptType }): Promise<{ script: ScriptType, lines: string[] }>`

Romanizes multiple lines at once.

## Supported Local Scripts

| Script | Library |
|--------|---------|
| Japanese | [@sglkc/kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) |
| Chinese | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) |
| Korean | [@romanize/korean](https://github.com/kntng/romanize) |
| Cyrillic (Russian/Ukrainian) | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) |
| Devanagari, Gujarati, Gurmukhi, Telugu, Kannada, Odia | [@indic-transliteration/sanscript](https://github.com/indic-transliteration/sanscript.js) |
| Tamil | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) |
| Thai | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) |
| Latin | no-op (returned as-is) |

## External Romanization Scripts

`malayalam`, `bengali`, `arabic`, `hebrew`, and `other` are marked as external. Use `requiresExternalRomanization(script)` to branch to an API-based romanizer. Calling `romanizeLine`/`romanizeLines` for these throws `UnsupportedRomanizationError`.

## License

MIT
