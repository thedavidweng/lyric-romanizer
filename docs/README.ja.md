# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **哲学：車輪の再発明をしない。**
> このプロジェクトは、ゼロからローマ字化ロジックを構築するのではなく、各スクリプトに特化したコミュニティ主導のライブラリを組み合わせる設計思想を採用しています。スクリプト検出、エンジンルーティング、方言処理、統一APIというオーケストレーション層に集中しています。依存関係にあるすべてのローマ字化エンジンは、各分野の専門家によって維持管理されている実績あるライブラリです。それがこのプロジェクトの本質です。

歌詞向けスクリプト検出・ローカルローマ字化エンジン。日本語、中国語（普通話・広東語）、韓国語、キリル文字、インド系文字、タミル語、タイ語の12以上のスクリプトをサポートし、すべてAPIコールなしでローカルで動作します。

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) から抽出。[OpenKara](https://github.com/thedavidweng/openkara) で使用されています。

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## 特徴

- **APIコール不要** — すべてのローマ字化がローカルで実行される
- **自動スクリプト検出** — テキストを渡すだけで使用スクリプトを自動判定
- **12以上のスクリプト** — 日本語、中国語、韓国語、キリル文字、6種類のインド系文字、タミル語、タイ語
- **広東語サポート** — 普通話ピン音に加え、広東語粤拼（Jyutping）にも対応
- **軽量検出サブパス** — ローマ字化エンジンを取り込まずに、スクリプト検出（および外部スクリプトの分類）のみをインポート可能
- **遅延エンジン** — すべてのエンジンは初回使用時に読み込まれ、ローマ字化するまでメインエントリのインポートにコストはかかりません
- **ウォームアップ** — 最初の行の前に、スクリプトのエンジン（および日本語辞書）を先読みできる
- **Kuromoji 辞書ヘルパー** — `lyric-romanizer/dict` が出荷済み辞書を特定するので、デスクトップアプリはデフォルト CDN ではなくローカルにホストできる
- **差し込み可能なエンジン** — 任意の組み込みエンジンを上書きするか、外部でローマ字化するスクリプト向けに独自のアダプターを差し込めます
- **観測可能なフォールバック** — 行ごとのフラグにより、エンジンが失敗して行が最終手段として翻字されたタイミングがわかります
- **ウクライナ語対応キリル文字** — ウクライナ固有文字を自動検出し、適切な翻字プリセットを適用
- **素の Node ESM で動作** — バンドラー不要

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
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// 1行だけローマ字化
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **検出の粒度** — `romanizeLines` は**全行を通して一度だけ**支配的なスクリプトを検出し、すべての行に固定します（意図的な設計です。日本語の曲の中の漢字のみの行も日本語エンジンに到達する必要があり、配列内にかながあれば `japanese` に固定されます）。一方、`romanizeLine` をループで呼び出すと**行ごとに**検出し、各行を異なるエンジンにルーティングする可能性があります。固定されたスクリプトの下では、純粋なラテン文字の行はそのまま返されます。**スクリプトが混在する配列**を参照してください。

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

// 検出専用サブパス — 軽量、ローマ字化の依存関係なし
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';

// 辞書ヘルパー — Node / ビルド時専用。kuromoji 辞書を特定し、
// バンドラプラグインが CDN ではなくアプリへコピーできるようにする。
import {
  KUROMOJI_DICT_FILES,
  KUROMOJI_PACKAGE,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';
```

### 型定義

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
  warmup(scripts?: ScriptType | readonly ScriptType[]): Promise<void>;
}

// `dialect` は 'chinese' でのみ有効。他のすべてのスクリプトでは無視されます。
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` は `lines` と対応し、エンジンが失敗して行が最終手段として
// ユニバーサル翻字された箇所が true になります。
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// エンジンアダプター：自身のスクリプトの1行をローマ字化します。スロー（または
// リジェクト）するとユニバーサル翻字フォールバックが発動します。
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

`Romanizer` インスタンスを返すファクトリ関数。すべてのエンジンは初回使用時に遅延読み込みされ、キャッシュされます。読み込みに失敗した場合は、次回の呼び出しで再試行されます。

```ts
const romanizer = createRomanizer();

// Kuromoji 辞書の CDN パスを上書き（セルフホスティングなど）
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});

// アイドル時にエンジンを先読み（日本語は辞書も解析する）
await romanizer.warmup('japanese');
await romanizer.warmup(['chinese', 'korean']);
```

> **バンドラ / Vite worker。** 遅延 `import()` が遅延のままなのは、バンドラがコード分割できる場合だけです。Vite のデフォルト `worker.format` は `'iife'` で、すべてのエンジンを worker にインラインします。`worker: { format: 'es' }` を設定すると、中国語の曲で日本語・広東語エンジンを解析しなくなります。`lyric-romanizer/dict` を worker やブラウザバンドルから import しないでください。Node 専用です。

#### `romanizer.warmup(scripts?)`

各スクリプトの組み込みエンジンを、行をローマ字化せずに読み込みます。`scripts` を省略すると、このインスタンスに残っているすべての組み込みローカルエンジンを先読みします。上書きまたは注入されたエンジンはスキップされます。ラテン文字と外部スクリプトは no-op です。読み込み失敗は **reject** します。`romanizeLines` と違い、warmup は汎用翻字へフォールバックしません。

#### `lyric-romanizer/dict`

kuromoji 辞書をアプリに同梱する消費者向けの Node / ビルド時ヘルパー（Tauri/Electron、静的な `public/dict/`）。ライブラリのデフォルト `japaneseDictPath` は jsDelivr CDN です。このエントリがあることで、それが唯一の選択肢ではなくなります。

```ts
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  KUROMOJI_DICT_FILES,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';

const src = resolveKuromojiDictDir();
const dest = 'public/dict';
mkdirSync(dest, { recursive: true });
for (const file of KUROMOJI_DICT_FILES) {
  copyFileSync(join(src, file), join(dest, file));
}

const romanizer = createRomanizer({ japaneseDictPath: '/dict/' });
```

#### エンジンアダプター

`options.engines` はスクリプトの組み込みエンジンを上書きします。あるいは、組み込みエンジンを持たないスクリプト（`arabic`、`hebrew`、`malayalam`、`bengali`、`other`）にエンジンを差し込むことで、`romanizeLines` が単一のインターフェースを通じてすべてのスクリプトを処理できるようになります。デフォルトでは、このライブラリは**ネットワークI/Oを一切行いません**。リモートアダプターを差し込むのは、呼び出し側の明示的な判断です。

```ts
const romanizer = createRomanizer({
  engines: {
    // ローカルエンジンを持たないスクリプト向けに独自の外部ローマ字化を用意します。
    arabic: async (line) => myTransliterationApi(line),
    // または組み込みエンジンを置き換えます（例：テストでのフェイク）。
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — もうスローしません
```

組み込み・注入を問わず、エンジンを持たないスクリプトは、引き続き `UnsupportedRomanizationError` をスローします。

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

組み込みエンジンを持たず、外部APIが必要なスクリプトに対して `true` を返します。軽量な `lyric-romanizer/detector` サブパスからインポートできるため、「外部サービスに分岐すべきか？」の判定にエンジンのペイロードは一切かかりません。

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

1行をローマ字化します。`script` を省略すると、`detectScript` によって**行ごとに**自動検出されます。`romanizeLine` をループで呼び出すと各行が異なるエンジンにルーティングされる可能性があり、配列全体に1つのスクリプトを固定する `romanizeLines` とは異なります。ラテン文字や文字を含まないコンテンツはそのまま返されます。

中国語テキストの場合、`dialect` オプションでローマ字化方式を制御します：`'mandarin'`（デフォルト）はピン音、`'cantonese'` は [Jyutping](https://github.com/CanCLID/to-jyutping) を使用します。他のスクリプトは `dialect` を無視します。

エンジン（組み込み・注入を問わず）を持たないスクリプトの場合、`UnsupportedRomanizationError` を**スローします**。

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè'（デフォルト：普通話/ピン音）

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

複数行を並列でローマ字化します。**全行を通して一度だけ**支配的なスクリプトを検出し、すべての行に固定します（**スクリプトが混在する配列**を参照）。スクリプト、ローマ字化された行、そして行ごとの `fallbacks` フラグを返します。`fallbacks` は、エンジンが失敗して行が最終手段としてユニバーサル翻字された箇所で `true` になります。

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

エンジン（組み込み、または `options.engines` で注入）を持たないスクリプトをローマ字化しようとした場合にスローされます。プログラム処理用の `script` プロパティを持ちます。

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
| グルムキー文字 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| テルグ語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| カンナダ語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| オディア語 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| タミル語 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| タイ語 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### 外部APIが必要

| スクリプト | 方法 |
|-----------|------|
| マラヤーラム語 | Google Translate `dt=rm` |
| ベンガル語 | Google Translate `dt=rm` |
| アラビア語 | Google Translate `dt=rm` |
| ヘブライ語 | Google Translate `dt=rm` |
| その他 | Google Translate `dt=rm` |

`requiresExternalRomanization()` でこれらを検出してお好みのAPIに分岐するか、あるいはAPIを一度**エンジンアダプター**として差し込んで、`romanizeLines` にすべてのスクリプトを処理させることもできます。

## スクリプト別の注意事項

### スクリプトが混在する配列

`romanizeLines` は配列全体の**支配的な**スクリプトをすべての行に固定します。これは意図的な設計です。日本語の曲の中の漢字のみの行は、それ単体では中国語と区別できません（漢字と中国語の漢字は同じUnicodeブロックを共有しているため）。そのため、配列全体の文脈だけが正しいエンジンへのルーティングを可能にします。知っておくべき影響は次のとおりです。

- 配列内のどこかにかなが1文字でもあれば、配列全体が `japanese` に固定されます — かなは決定的な証拠です。
- 配列内に*異なる*非ラテン文字の行があっても、固定されたエンジンに渡されます。
- 純粋なラテン文字の行（CJKの曲の中の英語のサビなど）は、固定されたエンジンに渡されず、**そのまま返されます**。
- 行ごとの `fallbacks` フラグは、エンジンが失敗して行がユニバーサル翻字に劣化した箇所を報告します。

真に行ごとのエンジンルーティングが必要な場合は、`romanizeLine` をループで呼び出してください — こちらは行ごとに検出します。

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
