# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **哲学：車輪の再発明をしない。**
> このプロジェクトは、ゼロからローマ字化ロジックを構築するのではなく、各スクリプトに特化したコミュニティ主導のライブラリを組み合わせる設計思想を採用しています。スクリプト検出、エンジンルーティング、方言処理、統一APIというオーケストレーション層に集中しています。依存関係にあるすべてのローマ字化エンジンは、各分野の専門家によって維持管理されている実績あるライブラリです。それがこのプロジェクトの本質です。

歌詞向けスクリプト検出・ローカルローマ字化エンジン。日本語、中国語（普通話・広東語）、韓国語、キリル文字、インド系文字、タミル語、タイ語の12以上のスクリプトをサポートし、すべてAPIコールなしでローカルで動作します。

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) から抽出。[OpenKara](https://github.com/thedavidweng/openkara) で使用されています。

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## 特徴

- **APIコール不要** — すべてのローマジ化がローカルで実行される
- **自動スクリプト検出** — テキストを渡すだけで使用スクリプトを自動判定
- **12以上のスクリプト** — 日本語、中国語、韓国語、キリル文字、7種類のインド系文字、タミル語、タイ語
- **広東語サポート** — 普通話ピン音に加え、広東語粤拼（Jyutping）にも対応
- **軽量検出サブパス** — ローマジ化エンジンなしでスクリプト検出のみをインポート可能
- **ウクライナ語対応キリル文字** — ウクライナ固有文字を自動検出し、適切な翻字プリセットを適用

## インストール

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## クイックスタート

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// スクリプトを自動検出してローマ字化
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// 1行だけローマ字化
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

## API

### インポート

```ts
// メインエントリ — ローマ字化エンジン全体
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// 検出専用サブパス — 軽量、ローマジ化の依存関係なし
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### 型定義

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

`Romanizer` インスタンスを返すファクトリ関数。日本語用の Kuroshiro エンジンは初回使用時に遅延初期化され、キャッシュされます。

```ts
const romanizer = createRomanizer();

// Kuromoji 辞書の CDN パスを上書き（セルフホスティングなど）
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

### `detectScript(lines)`

与えられたテキスト行の支配的なスクリプトを検出します。まず日本語のかなを判定し（確定的）、その後他のスクリプトを文字数でスコアリングします。

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

高速チェック — テキストにラテン文字のみが含まれる場合に `true` を返します（CJK、キリル文字、インド系文字などは含まない）。ローマ字化を完全にスキップするのに便利です。

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false（文字なし）
```

### `requiresExternalRomanization(script)`

ローカルでローマ字化できず、外部APIが必要なスクリプトに対して `true` を返します。

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

1行をローマ字化します。`script` を省略すると `detectScript` で自動検出されます。ラテン文字や文字を含まないコンテンツはそのまま返されます。

中国語テキストの場合、`dialect` オプションでローマ字化方式を制御します：`'mandarin'`（デフォルト）はピン音、`'cantonese'` は [Jyutping](https://github.com/CanCLID/to-jyutping) を使用します。

**外部スクリプトの場合** `UnsupportedRomanizationError` をスローします。

```ts
await romanizer.romanizeLine('こんにちは');
// 'konnichiha'

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world'（そのまま）

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

複数行を並列でローマ字化します。検出されたスクリプトとローマ字化された行を返します。

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

外部APIが必要なスクリプトをローマ字化しようとした場合にスローされます。プログラム処理用の `script` プロパティを持ちます。

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // 外部APIにフォールバック
  }
}
```

## サポートされているスクリプト

### ローカル（完全オフライン）

| スクリプト | エンジン | 例 |
|-----------|---------|-----|
| ユニバーサル *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| 日本語 | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| 中国語（普通話） | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| 中国語（広東語） | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| 韓国語 | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| キリル文字 | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| デーバナーガリー | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| グジャラート語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| グルムキー文字 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| テルグ語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| カンナダ語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| オディア語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| タミル語 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| タイ語 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### 外部APIが必要

| スクリプト | 方法 |
|-----------|------|
| マラヤーラム語 | Google Translate `dt=rm` |
| ベンガル語 | Google Translate `dt=rm` |
| アラビア語 | Google Translate `dt=rm` |
| ヘブライ語 | Google Translate `dt=rm` |
| その他 | Google Translate `dt=rm` |

`requiresExternalRomanization()` で検出して、お好みのAPIに分岐してください。

## スクリプト別の注意事項

### キリル文字の検出

キリル文字はウクライナ固有の文字（`і`、`ї`、`є`、`ґ`）を自動検出し、ウクライナ語の翻字プリセットを適用します。その他のキリル文字はロシア語として処理されます。

### 広東語サポート

中国語はデフォルトで普通話（ピン音）になります。`RomanizeOptions` で `dialect: 'cantonese'` を渡すと、中国語テキストを [Jyutping](https://github.com/CanCLID/to-jyutping) でローマ字化します。

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## ライセンス

MIT
